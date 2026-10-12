import { ITEM_STATUS, PLATFORM_LABELS } from '../constants/item.constants.js';
import { Item } from '../models/Item.js';
import { ApiError } from '../utils/ApiError.js';
import * as itemService from './item.service.js';
import * as pushService from './push.service.js';
import * as tokenService from './token.service.js';

const MAX_LATE_MS = 24 * 60 * 60 * 1000; // reminders older than this are skipped, never sent late
const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 50;
const NOTIFICATION_SNOOZE_MINUTES = 60;

const VERBS = {
  video: 'watch',
  image: 'view',
  repo: 'check out',
  post: 'read',
  article: 'read',
  other: 'open',
};

const clip = (text, max) => {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const buildReminderPayload = (item) => {
  const meta = [
    PLATFORM_LABELS[item.platform],
    item.durationMinutes && `${item.durationMinutes} min`,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    title: `Time to ${VERBS[item.contentType] ?? 'open'} this`,
    body: [
      clip(item.title || hostOf(item.url) || item.url, 120),
      meta,
      item.notes ? `“${clip(item.notes, 100)}”` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    tag: `item-${item._id}`,
    url: `/focus/${item._id}`,
    itemId: String(item._id),
    actionToken: tokenService.signActionToken({ userId: item.user, itemId: item._id }),
    actions: [
      { action: 'complete', title: 'Done' },
      { action: 'snooze', title: 'Snooze 1h' },
    ],
    timestamp: Date.now(),
  };
};

// ONE atomic database operation finds a due item AND marks it as notified.
// If two servers run at once, only one of them gets any given item.
const claimNextDue = () => {
  const now = new Date();

  return Item.findOneAndUpdate(
    {
      status: ITEM_STATUS.SCHEDULED,
      scheduledAt: { $lte: now, $gte: new Date(now.getTime() - MAX_LATE_MS) },
      notifiedAt: null,
      // $not/$gte (rather than $lt) also matches older items that have no counter yet
      notifyAttempts: { $not: { $gte: MAX_ATTEMPTS } },
    },
    { $set: { notifiedAt: now }, $inc: { notifyAttempts: 1 } },
    { sort: { scheduledAt: 1 }, new: true }
  );
};

// Gives the item back to the scheduler. The filter makes sure we never undo a snooze
// or reschedule the user made in the meantime.
const release = (item) =>
  Item.updateOne(
    { _id: item._id, scheduledAt: item.scheduledAt, notifiedAt: item.notifiedAt },
    { $set: { notifiedAt: null } }
  );

const deliver = async (item) => {
  let result;

  try {
    result = await pushService.sendToUser(item.user, buildReminderPayload(item), {
      topic: String(item._id),
    });
  } catch (error) {
    await release(item).catch(() => {});
    throw error;
  }

  // Only a temporary failure with zero successes is worth another try
  if (result.delivered === 0 && result.transient > 0) await release(item);

  return result;
};

export const processDueReminders = async () => {
  const claimed = [];

  while (claimed.length < BATCH_SIZE) {
    const item = await claimNextDue();
    if (!item) break;
    claimed.push(item);
  }

  if (claimed.length === 0) return 0;

  // Deliver in parallel so one slow push service can't hold up the rest
  const outcomes = await Promise.allSettled(claimed.map(deliver));
  outcomes.forEach((outcome, index) => {
    if (outcome.status === 'rejected') {
      console.error(`[reminders] ${claimed[index]._id} failed:`, outcome.reason);
    }
  });

  console.log(`[reminders] processed ${claimed.length} due item(s)`);
  return claimed.length;
};

// Runs when the user taps Done or Snooze inside a notification
export const performAction = async ({ token, action }) => {
  let claims;
  try {
    claims = tokenService.verifyActionToken(token);
  } catch {
    throw new ApiError(401, 'This notification action has expired. Open Brainly instead.');
  }

  if (action === 'complete') {
    await itemService.completeItem(claims.sub, claims.item);
  } else {
    await itemService.snoozeItem(claims.sub, claims.item, NOTIFICATION_SNOOZE_MINUTES);
  }
};