import { Collection } from '../models/Collection.js';
import { Item } from '../models/Item.js';
import { WatchWindow } from '../models/WatchWindow.js';

// Everything the user owns, in a stable, human-readable shape.
// Deliberately left out: password, share tokens, ids and internal bookkeeping.
export const buildBackup = async (user) => {
  const [collections, windows, items] = await Promise.all([
    Collection.find({ user: user._id }).sort({ name: 1 }).lean(),
    WatchWindow.find({ user: user._id }).sort({ startMinutes: 1 }).lean(),
    Item.find({ user: user._id }).sort({ createdAt: 1 }).lean(),
  ]);

  const collectionName = new Map(collections.map((entry) => [String(entry._id), entry.name]));

  return {
    app: 'brainly',
    version: 1,
    exportedAt: new Date().toISOString(),
    user: { name: user.name, email: user.email, timezone: user.timezone },
    collections: collections.map(({ name, description, color }) => ({ name, description, color })),
    watchWindows: windows.map(({ name, days, startMinutes, endMinutes }) => ({
      name,
      days,
      startMinutes,
      endMinutes,
    })),
    items: items.map((item) => ({
      url: item.url,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      author: item.author,
      platform: item.platform,
      contentType: item.contentType,
      durationMinutes: item.durationMinutes,
      notes: item.notes,
      tags: item.tags,
      collection: item.collection ? collectionName.get(String(item.collection)) ?? null : null,
      status: item.status,
      scheduledAt: item.scheduledAt,
      completedAt: item.completedAt,
      snoozeCount: item.snoozeCount,
      createdAt: item.createdAt,
    })),
  };
};