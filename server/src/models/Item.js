import mongoose from 'mongoose';
import {
  CONTENT_TYPES,
  ITEM_STATUS,
  ITEM_STATUSES,
  PLATFORMS,
  SNOOZE_REVIEW_THRESHOLD,
} from '../constants/item.constants.js';

const itemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    url: { type: String, required: true, trim: true, maxlength: 2048 },
    normalizedUrl: { type: String, required: true },
    platform: { type: String, enum: PLATFORMS, default: 'other' },
    contentType: { type: String, enum: CONTENT_TYPES, default: 'article' },

    // Filled automatically in Phase 4
    title: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    thumbnail: { type: String, default: null },
    durationMinutes: { type: Number, min: 1, max: 600, default: null },

    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    tags: { type: [String], default: [] },

    status: { type: String, enum: ITEM_STATUSES, default: ITEM_STATUS.INBOX },
    scheduledAt: { type: Date, default: null }, // stored in UTC
    notifiedAt: { type: Date, default: null }, // set by the scheduler in Phase 8
    completedAt: { type: Date, default: null },
    snoozeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Library listing and filtering
itemSchema.index({ user: 1, status: 1, scheduledAt: 1 });
// Duplicate detection
itemSchema.index({ user: 1, normalizedUrl: 1 });
// Tag filter and tag counts
itemSchema.index({ user: 1, tags: 1 });
// "Which reminders are due right now?" (the Phase 8 scheduler)
itemSchema.index({ status: 1, scheduledAt: 1 });

itemSchema.virtual('needsReview').get(function () {
  return this.snoozeCount >= SNOOZE_REVIEW_THRESHOLD;
});

itemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.id;
    delete ret.normalizedUrl; // internal only
    return ret;
  },
});

export const Item = mongoose.model('Item', itemSchema);