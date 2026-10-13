import { ITEM_STATUS } from '../constants/item.constants.js';
import { Item } from '../models/Item.js';
import { ApiError } from '../utils/ApiError.js';
import * as collectionService from './collection.service.js';

const ACTIVE = [ITEM_STATUS.INBOX, ITEM_STATUS.SCHEDULED];
const CLOSED = [ITEM_STATUS.COMPLETED, ITEM_STATUS.ARCHIVED];
const MAX_TAGS = 10;

const summarize = (result) => ({ matched: result.matchedCount, modified: result.modifiedCount });

// A database-side update that keeps existing tags, appends only new ones and caps at 10.
// $literal matters: without it, a tag such as "$notes" would be read as a field reference.
const appendTags = (tags) => [
  {
    $set: {
      tags: {
        $slice: [
          {
            $concatArrays: [
              { $ifNull: ['$tags', []] },
              {
                $filter: {
                  input: { $literal: tags },
                  cond: { $not: [{ $in: ['$$this', { $ifNull: ['$tags', []] }] }] },
                },
              },
            ],
          },
          MAX_TAGS,
        ],
      },
    },
  },
];

export const runBulk = async (userId, input) => {
  const { ids, action } = input;
  // Every operation is scoped to the user, so other people's ids simply match nothing
  const owned = { _id: { $in: ids }, user: userId };

  switch (action) {
    case 'complete':
      return summarize(
        await Item.updateMany(
          { ...owned, status: { $in: ACTIVE } },
          { $set: { status: ITEM_STATUS.COMPLETED, completedAt: new Date() } }
        )
      );

    case 'archive':
      return summarize(
        await Item.updateMany(
          { ...owned, status: { $ne: ITEM_STATUS.ARCHIVED } },
          { $set: { status: ITEM_STATUS.ARCHIVED } }
        )
      );

    case 'restore':
      return summarize(
        await Item.updateMany(
          { ...owned, status: { $in: CLOSED } },
          {
            $set: {
              status: ITEM_STATUS.INBOX,
              scheduledAt: null,
              notifiedAt: null,
              notifyAttempts: 0,
              completedAt: null,
              snoozeCount: 0,
            },
          }
        )
      );

    case 'delete': {
      const result = await Item.deleteMany(owned);
      return { matched: result.deletedCount, modified: result.deletedCount };
    }

    case 'schedule': {
      const { scheduledAt } = input; // a Date, or null to send items back to the inbox
      return summarize(
        await Item.updateMany(
          { ...owned, status: { $in: ACTIVE } },
          {
            $set: {
              scheduledAt,
              status: scheduledAt ? ITEM_STATUS.SCHEDULED : ITEM_STATUS.INBOX,
              notifiedAt: null,
              notifyAttempts: 0,
              snoozeCount: 0,
              completedAt: null,
            },
          }
        )
      );
    }

    case 'tag':
      // The update is a pipeline (an array of stages), which Mongoose only runs when told to
      return summarize(
        await Item.updateMany(owned, appendTags(input.tags), { updatePipeline: true })
      );

    case 'move': {
      const { collection } = input;
      if (collection) await collectionService.assertOwned(userId, collection);
      return summarize(await Item.updateMany(owned, { $set: { collection } }));
    }

    default:
      throw new ApiError(400, 'Unknown action');
  }
};