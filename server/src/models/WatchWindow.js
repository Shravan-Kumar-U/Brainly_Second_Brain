import mongoose from 'mongoose';

const watchWindowSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [40, 'Name must be at most 40 characters'],
    },
    // 0 = Sunday ... 6 = Saturday
    days: {
      type: [Number],
      validate: {
        validator: (list) =>
          list.length > 0 && list.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: 'Pick at least one day',
      },
    },
    // Wall-clock times as minutes after midnight, interpreted in the user's timezone
    startMinutes: { type: Number, required: true, min: 0, max: 1439 },
    endMinutes: { type: Number, required: true, min: 1, max: 1440 },
  },
  { timestamps: true }
);

// Also runs on partial updates, where the request alone can't tell if the pair is valid
watchWindowSchema.pre('validate', function checkRange() {
  if (this.endMinutes <= this.startMinutes) {
    this.invalidate('endMinutes', 'End must be after start');
  }
});

watchWindowSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

export const WatchWindow = mongoose.model('WatchWindow', watchWindowSchema);