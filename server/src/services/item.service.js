import { ITEM_STATUS } from '../constants/item.constants.js';
import { Item } from '../models/Item.js';
import { ApiError } from '../utils/ApiError.js';
import { detectPlatform, normalizeUrl } from '../utils/url.util.js';
import { isUnsafeUrlError } from '../utils/ssrf.util.js';
import { enrichInBackground, enrichItem } from './itemEnrichment.service.js';
import { fetchMetadata } from './metadata/index.js';
import * as collectionService from './collection.service.js';

const MINUTE_MS = 60 * 1000;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The ONLY way services fetch a single item. Scoping by user is the ownership check.
const findOwned = async (userId, id) => {
  const item = await Item.findOne({ _id: id, user: userId });
  if (!item) throw new ApiError(404, 'Item not found');
  return item;
};

export const createItem = async (userId, data) => {
   if (data.collection) await collectionService.assertOwned(userId, data.collection);
  const normalizedUrl = normalizeUrl(data.url);

  const duplicate = await Item.findOne({
    user: userId,
    normalizedUrl,
    status: { $in: [ITEM_STATUS.INBOX, ITEM_STATUS.SCHEDULED] },
  });
  if (duplicate) {
    throw new ApiError(409, 'You already saved this link', {
      existingItemId: duplicate._id,
    });
  }

  const detected = detectPlatform(data.url);

  const item = await Item.create({
    user: userId,
    url: data.url,
    normalizedUrl,
    platform: detected.platform,
    contentType: data.contentType ?? detected.contentType,
    title: data.title,
    notes: data.notes,
    tags: data.tags,
    collection: data.collection ?? null,
    durationMinutes: data.durationMinutes,
    scheduledAt: data.scheduledAt ?? null,
    status: data.scheduledAt ? ITEM_STATUS.SCHEDULED : ITEM_STATUS.INBOX,
  });

  // The user gets an instant response; metadata arrives a few seconds later
  enrichInBackground(item._id);

  return item;
};

export const listItems = async (userId, query) => {
  const { status, platform, contentType, tag, q, from, to, maxDuration, collection, sort, page, limit } = query;

  const filter = { user: userId };

  // No status given = everything except archived
  if (status === 'active') {
    filter.status = { $in: [ITEM_STATUS.INBOX, ITEM_STATUS.SCHEDULED] };
  } else {
    filter.status = status ?? { $ne: ITEM_STATUS.ARCHIVED };
  }
  if (platform) filter.platform = platform;
  if (contentType) filter.contentType = contentType;
  if (tag) filter.tags = tag;
  if (collection) filter.collection = collection;
  if (maxDuration) filter.durationMinutes = { $lte: maxDuration }; // "I have 15 minutes" mode
  if (from || to) {
    filter.scheduledAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  }
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i'); // escaped, so user input can't inject regex
    filter.$or = [{ title: pattern }, { notes: pattern }, { url: pattern }, { tags: pattern }];
  }

  const sortField = sort.replace('-', '');
  // _id is a tie-breaker so pagination never repeats or skips items
  const sortSpec = { [sortField]: sort.startsWith('-') ? -1 : 1, _id: -1 };

  const [items, total] = await Promise.all([
    Item.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit),
    Item.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  };
};

export const getItem = (userId, id) => findOwned(userId, id);

export const updateItem = async (userId, id, changes) => {
  const item = await findOwned(userId, id);
  const { scheduledAt, ...fields } = changes;

  if (collection !== undefined) {
    if (collection) await collectionService.assertOwned(userId, collection);
    item.collection = collection; // null removes it from its collection
  }

  Object.assign(item, fields);

    if (scheduledAt !== undefined) {
    item.scheduledAt = scheduledAt;
    item.snoozeCount = 0; // a deliberate new time means "yes, I still want this"
    item.notifiedAt = null;
    item.notifyAttempts = 0;
    item.completedAt = null;
    item.status = scheduledAt ? ITEM_STATUS.SCHEDULED : ITEM_STATUS.INBOX;
  }

  await item.save();
  return item;
};

export const completeItem = async (userId, id) => {
  const item = await findOwned(userId, id);
  if (item.status === ITEM_STATUS.COMPLETED) return item;
  item.status = ITEM_STATUS.COMPLETED;
  item.completedAt = new Date();
  await item.save();
  return item;
};

export const snoozeItem = async (userId, id, minutes) => {
  const item = await findOwned(userId, id);

  if ([ITEM_STATUS.COMPLETED, ITEM_STATUS.ARCHIVED].includes(item.status)) {
    throw new ApiError(409, 'Only active items can be snoozed');
  }

  item.scheduledAt = new Date(Date.now() + minutes * MINUTE_MS);
  item.status = ITEM_STATUS.SCHEDULED;
  item.notifiedAt = null;
  item.notifyAttempts = 0;
  item.snoozeCount += 1;

  await item.save();
  return item;
};

export const archiveItem = async (userId, id) => {
  const item = await findOwned(userId, id);
  item.status = ITEM_STATUS.ARCHIVED;
  await item.save();
  return item;
};

// Brings a completed/archived item back to the inbox with a clean slate
export const restoreItem = async (userId, id) => {
  const item = await findOwned(userId, id);
  item.status = ITEM_STATUS.INBOX;
  item.scheduledAt = null;
  item.notifiedAt = null;
  item.notifyAttempts = 0;
  item.completedAt = null;
  item.snoozeCount = 0;
  await item.save();
  return item;
};

export const deleteItem = async (userId, id) => {
  const result = await Item.deleteOne({ _id: id, user: userId });
  if (result.deletedCount === 0) throw new ApiError(404, 'Item not found');
};

export const getTagCounts = (userId) =>
  Item.aggregate([
    { $match: { user: userId, status: { $ne: ITEM_STATUS.ARCHIVED } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, tag: '$_id', count: 1 } },
  ]);


  // Retry for items whose metadata failed (or never ran). Fills empty fields only.
export const refreshMetadata = async (userId, id) => {
  const item = await findOwned(userId, id);
  await enrichItem(item._id);
  return Item.findById(item._id);
};

// Used by the "Add item" screen to show a preview before saving
export const previewLink = async (url) => {
  const { platform, contentType } = detectPlatform(url);

  try {
    const metadata = await fetchMetadata(url);
    return { url, platform, contentType, metadata };
  } catch (error) {
    if (isUnsafeUrlError(error)) {
      throw new ApiError(400, 'This link points to a private or unsupported address');
    }
    throw error;
  }
};


const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

const rankItem = (item, minutes, now) => {
  const due = item.scheduledAt ? item.scheduledAt.getTime() : null;
  let score;
  let reason;

  if (item.status === ITEM_STATUS.SCHEDULED && due !== null && due <= now) {
    score = 100 + Math.min(50, (now - due) / HOUR_MS); // the longer overdue, the higher
    reason = 'overdue';
  } else if (item.status === ITEM_STATUS.SCHEDULED && due !== null && due - now <= DAY_MS) {
    score = 60;
    reason = 'due-soon';
  } else if (item.status === ITEM_STATUS.INBOX) {
    score = 30 + Math.min(20, (now - item.createdAt.getTime()) / DAY_MS); // oldest waits longest
    reason = 'waiting';
  } else {
    score = 10; // scheduled for later: you already chose another time
    reason = 'fits';
  }

  if (minutes) {
    if (item.durationMinutes) score += 10 * (item.durationMinutes / minutes); // use more of your window
    else score -= 15; // unknown length is a gamble
  }
  if (item.needsReview) score -= 20; // snoozed 3+ times: probably not urgent

  return { score, reason };
};

export const pickItem = async (userId, { minutes, exclude = [] }) => {
  const filter = { user: userId, status: { $in: [ITEM_STATUS.INBOX, ITEM_STATUS.SCHEDULED] } };
  if (exclude.length > 0) filter._id = { $nin: exclude };
  // A null length also matches items with no length stored
  if (minutes) filter.$or = [{ durationMinutes: { $lte: minutes } }, { durationMinutes: null }];

  const candidates = await Item.find(filter).sort({ createdAt: 1 }).limit(200);
  if (candidates.length === 0) return null;

  const now = Date.now();
  const best = candidates
    .map((item) => ({ item, ...rankItem(item, minutes, now) }))
    .sort((a, b) => b.score - a.score)[0];

  return { item: best.item, reason: best.reason };
};