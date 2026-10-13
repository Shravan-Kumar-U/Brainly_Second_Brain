import { PushSubscription } from '../models/PushSubscription.js';
import { User } from '../models/User.js';
import { localParts, safeTimezone } from '../utils/time.util.js';
import { getInsights } from './insights.service.js';
import { sendToUser } from './push.service.js';

const REVIEW_WEEKDAY = 0; // Sunday
const REVIEW_HOUR = 18; // 6 PM, in the user's own timezone

const sum = (days, field) => days.reduce((total, day) => total + day[field], 0);
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

// Returns the notification, or null when there is genuinely nothing to report
export const buildReviewPayload = async (user, { force = false } = {}) => {
  const { daily, summary, streak } = await getInsights(user);

  const finished = sum(daily.slice(-7), 'completed');
  const lastWeek = sum(daily.slice(-14, -7), 'completed');
  const saved = sum(daily.slice(-7), 'saved');

  if (!force && finished === 0 && saved === 0 && summary.active === 0) return null;

  const lines = [];

  if (finished > 0) {
    const diff = finished - lastWeek;
    const trend = diff === 0 ? '' : ` (${diff > 0 ? '+' : ''}${diff} vs last week)`;
    lines.push(`You finished ${plural(finished, 'item')}${trend}.`);
  } else if (summary.active > 0) {
    lines.push("Nothing finished this week, and that's okay.");
  } else {
    lines.push('Nothing yet this week. Save a link to get started.');
  }

  if (summary.active > 0) {
    lines.push(
      `${summary.active} waiting${summary.overdue > 0 ? `, ${summary.overdue} overdue` : ''}.`
    );
  }
  if (streak.current >= 2) lines.push(`${streak.current}-day streak.`);

  return {
    title: 'Your week in Brainly',
    body: lines.join('\n'),
    tag: 'weekly-review',
    url: '/insights',
    timestamp: Date.now(),
  };
};

// Gives the Sunday back if delivery failed for a temporary reason, so a later run retries
const release = (userId, key, previousKey) =>
  User.updateOne(
    { _id: userId, 'weeklyReview.lastSentKey': key },
    { $set: { 'weeklyReview.lastSentKey': previousKey } }
  );

export const processWeeklyReviews = async () => {
  // Only people who can actually receive a notification
  const userIds = await PushSubscription.distinct('user');
  if (userIds.length === 0) return 0;

  const users = await User.find({
    _id: { $in: userIds },
    'weeklyReview.enabled': { $ne: false }, // missing counts as on
  }).select('name timezone weeklyReview');

  const now = new Date();
  let sent = 0;

  for (const user of users) {
    const local = localParts(now, safeTimezone(user.timezone));
    if (local.weekday !== REVIEW_WEEKDAY || local.hour < REVIEW_HOUR) continue;
    if (user.weeklyReview?.lastSentKey === local.dateKey) continue;

    // One atomic update decides which server sends it. Losing the race returns null.
    const before = await User.findOneAndUpdate(
      { _id: user._id, 'weeklyReview.lastSentKey': { $ne: local.dateKey } },
      { $set: { 'weeklyReview.lastSentKey': local.dateKey } },
      { returnDocument: 'before' }
    ).select('weeklyReview');
    if (!before) continue;

    const previousKey = before.weeklyReview?.lastSentKey ?? null;

    try {
      const payload = await buildReviewPayload(user);
      if (!payload) continue; // nothing to say; the Sunday stays marked as handled

      const result = await sendToUser(user._id, payload, { topic: 'weekly-review' });
      if (result.delivered > 0) sent += 1;
      else if (result.transient > 0) await release(user._id, local.dateKey, previousKey);
    } catch (error) {
      console.error(`[weekly-review] ${user._id} failed:`, error);
      await release(user._id, local.dateKey, previousKey).catch(() => {});
    }
  }

  if (sent > 0) console.log(`[weekly-review] sent ${sent} review(s)`);
  return sent;
};

// The "Send me a preview" button: always sends, arrives in about 5 seconds
export const sendPreviewLater = (user, delayMs = 5000) => {
  setTimeout(async () => {
    try {
      const payload = await buildReviewPayload(user, { force: true });
      await sendToUser(user._id, payload, { ttl: 120, topic: 'weekly-review' });
    } catch (error) {
      console.error('[weekly-review] preview failed:', error.message);
    }
  }, delayMs).unref();
};