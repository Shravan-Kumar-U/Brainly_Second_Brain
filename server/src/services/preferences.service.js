import { User } from '../models/User.js';
import { safeTimezone } from '../utils/time.util.js';

export const toPreferences = (user) => ({
  timezone: safeTimezone(user.timezone),
  weeklyReview: user.weeklyReview?.enabled !== false, // missing = on
});

export const update = (userId, { timezone, weeklyReview }) => {
  const changes = {};
  if (timezone !== undefined) changes.timezone = timezone;
  if (weeklyReview !== undefined) changes['weeklyReview.enabled'] = weeklyReview;

  return User.findByIdAndUpdate(userId, { $set: changes }, { returnDocument: 'after' });
};