import crypto from 'node:crypto';

import { MAX_COLLECTIONS_PER_USER, MAX_SHARED_ITEMS } from '../constants/collection.constants.js';
import { ITEM_STATUS } from '../constants/item.constants.js';
import { Collection } from '../models/Collection.js';
import { Item } from '../models/Item.js';
import { ApiError } from '../utils/ApiError.js';

const newToken = () => crypto.randomBytes(18).toString('base64url'); // 24 URL-safe characters

const findOwned = async (userId, id) => {
  const collection = await Collection.findOne({ _id: id, user: userId });
  if (!collection) throw new ApiError(404, 'Collection not found');
  return collection;
};

// Used by the item service before it files an item into a collection
export const assertOwned = async (userId, id) => {
  const exists = await Collection.exists({ _id: id, user: userId });
  if (!exists) throw new ApiError(404, 'Collection not found');
};

// The unique index is the real guard. Two fast requests can both pass a "does it exist?" check.
const saveUnique = async (collection) => {
  try {
    await collection.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'You already have a collection with that name');
    }
    throw error;
  }
  return collection;
};

export const listCollections = async (userId) => {
  const [collections, counts] = await Promise.all([
    Collection.find({ user: userId }).sort({ name: 1 }).collation({ locale: 'en', strength: 2 }),
    Item.aggregate([
      { $match: { user: userId, collection: { $ne: null }, status: { $ne: ITEM_STATUS.ARCHIVED } } },
      {
        $group: {
          _id: '$collection',
          itemCount: { $sum: 1 },
          doneCount: { $sum: { $cond: [{ $eq: ['$status', ITEM_STATUS.COMPLETED] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const byId = new Map(counts.map((row) => [String(row._id), row]));

  return collections.map((collection) => {
    const row = byId.get(String(collection._id));
    return { ...collection.toJSON(), itemCount: row?.itemCount ?? 0, doneCount: row?.doneCount ?? 0 };
  });
};

export const createCollection = async (userId, data) => {
  const count = await Collection.countDocuments({ user: userId });
  if (count >= MAX_COLLECTIONS_PER_USER) {
    throw new ApiError(409, `You can have up to ${MAX_COLLECTIONS_PER_USER} collections`);
  }

  return saveUnique(new Collection({ user: userId, ...data }));
};

export const updateCollection = async (userId, id, changes) => {
  const collection = await findOwned(userId, id);
  Object.assign(collection, changes);
  return saveUnique(collection);
};

export const deleteCollection = async (userId, id) => {
  const collection = await findOwned(userId, id);

  // The links themselves are never deleted, only taken out of the collection
  await Item.updateMany({ user: userId, collection: collection._id }, { $set: { collection: null } });
  await collection.deleteOne();
};

export const enableShare = async (userId, id) => {
  const collection = await findOwned(userId, id);

  if (!collection.shareToken) {
    collection.shareToken = newToken();
    collection.sharedAt = new Date();
    await collection.save();
  }
  return collection;
};

export const regenerateShare = async (userId, id) => {
  const collection = await findOwned(userId, id);
  collection.shareToken = newToken(); // the old link stops working at once
  collection.sharedAt = new Date();
  await collection.save();
  return collection;
};

export const disableShare = async (userId, id) => {
  const collection = await findOwned(userId, id);
  collection.shareToken = undefined;
  collection.sharedAt = undefined;
  await collection.save();
  return collection;
};

// What a stranger holding the link may see. Fields are listed explicitly, so a field
// added to Item later can never leak here by accident.
export const getSharedView = async (token) => {
  const collection = await Collection.findOne({ shareToken: token }).populate({
    path: 'user',
    select: 'name',
  });
  if (!collection) throw new ApiError(404, 'This link is no longer available');

  const items = await Item.find({
    user: collection.user._id,
    collection: collection._id,
    status: { $ne: ITEM_STATUS.ARCHIVED },
  })
    .sort({ createdAt: -1 })
    .limit(MAX_SHARED_ITEMS)
    .select('url title description thumbnail durationMinutes author platform contentType')
    .lean();

  return {
    collection: {
      name: collection.name,
      description: collection.description,
      color: collection.color,
      ownerName: collection.user.name.split(' ')[0], // first name only, never the email
      itemCount: items.length,
    },
    items: items.map((item) => ({
      _id: item._id,
      url: item.url,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      durationMinutes: item.durationMinutes,
      author: item.author,
      platform: item.platform,
      contentType: item.contentType,
    })),
  };
};