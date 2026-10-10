import { METADATA_STATUS } from '../constants/item.constants.js';
import { Item } from '../models/Item.js';
import { fetchMetadata } from './metadata/index.js';

export const enrichItem = async (itemId) => {
  const item = await Item.findById(itemId);
  if (!item) return; // deleted in the meantime

  let metadata = null;
  try {
    metadata = await fetchMetadata(item.url);
  } catch (error) {
    console.warn(`[enrich] ${itemId}: ${error.message}`);
  }

  const found = Boolean(metadata?.title || metadata?.thumbnail);
  const updates = {
    metadataStatus: found ? METADATA_STATUS.DONE : METADATA_STATUS.FAILED,
    metadataFetchedAt: new Date(),
  };

  if (found) {
    // Never overwrite anything the user typed themselves
    if (!item.title && metadata.title) updates.title = metadata.title;
    if (!item.description && metadata.description) updates.description = metadata.description;
    if (!item.thumbnail && metadata.thumbnail) updates.thumbnail = metadata.thumbnail;
    if (!item.durationMinutes && metadata.durationMinutes) {
      updates.durationMinutes = metadata.durationMinutes;
    }
    if (!item.author && metadata.author) updates.author = metadata.author;
  }

  // $set touches only these fields, so a snooze or edit made meanwhile is safe
  await Item.updateOne({ _id: item._id }, { $set: updates });
};

// Fire-and-forget. The .catch is REQUIRED: our server.js shuts down on any
// unhandled promise rejection, so a background task must never leak one.
export const enrichInBackground = (itemId) => {
  enrichItem(itemId).catch((error) => {
    console.error(`[enrich] ${itemId} crashed:`, error);
  });
};