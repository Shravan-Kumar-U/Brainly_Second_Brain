import mongoose from 'mongoose';

import { COLLECTION_COLORS } from '../constants/collection.constants.js';

const collectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [40, 'Name must be at most 40 characters'],
    },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    color: { type: String, enum: COLLECTION_COLORS, default: 'violet' },

    // No default on purpose: a missing field means "not shared"
    shareToken: { type: String },
    sharedAt: { type: Date },
  },
  { timestamps: true }
);

// One name per user, ignoring upper/lower case
collectionSchema.index({ user: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Only documents that HAVE a token take part in uniqueness. A plain unique index
// would treat a stored null as a value and allow just one unshared collection.
collectionSchema.index(
  { shareToken: 1 },
  { unique: true, partialFilterExpression: { shareToken: { $type: 'string' } } }
);

collectionSchema.virtual('isShared').get(function isShared() {
  return Boolean(this.shareToken);
});

collectionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

export const Collection = mongoose.model('Collection', collectionSchema);