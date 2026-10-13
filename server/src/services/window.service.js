import { WatchWindow } from '../models/WatchWindow.js';
import { ApiError } from '../utils/ApiError.js';
import { localParts, safeTimezone, zonedToUtc } from '../utils/time.util.js';

const MAX_WINDOWS_PER_USER = 10;
const MIN_LEAD_MS = 10 * 60 * 1000; // a suggestion must start at least 10 minutes from now
const LOOKAHEAD_DAYS = 8; // covers a window that only happens once a week
const MAX_SUGGESTIONS = 3;

const findOwned = async (userId, id) => {
  const slot = await WatchWindow.findOne({ _id: id, user: userId });
  if (!slot) throw new ApiError(404, 'Watch window not found');
  return slot;
};

export const listWindows = (userId) => WatchWindow.find({ user: userId }).sort({ startMinutes: 1 });

export const createWindow = async (userId, data) => {
  const count = await WatchWindow.countDocuments({ user: userId });
  if (count >= MAX_WINDOWS_PER_USER) {
    throw new ApiError(409, `You can have up to ${MAX_WINDOWS_PER_USER} watch windows`);
  }
  return WatchWindow.create({ user: userId, ...data });
};

export const updateWindow = async (userId, id, changes) => {
  const slot = await findOwned(userId, id);
  Object.assign(slot, changes);
  await slot.save(); // the model checks that the end is after the start
  return slot;
};

export const deleteWindow = async (userId, id) => {
  const result = await WatchWindow.deleteOne({ _id: id, user: userId });
  if (result.deletedCount === 0) throw new ApiError(404, 'Watch window not found');
};

// The next few windows that start in the future and are long enough for the item
export const suggest = async (user, { minutes } = {}) => {
  const windows = await WatchWindow.find({ user: user._id }).lean();
  if (windows.length === 0) return { hasWindows: false, suggestions: [] };

  const timeZone = safeTimezone(user.timezone);
  const now = Date.now();
  const today = localParts(new Date(now), timeZone);
  const candidates = [];

  for (let offset = 0; offset < LOOKAHEAD_DAYS; offset += 1) {
    // Calendar arithmetic with UTC as a plain calculator, so daylight saving can't skip a day
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    const date = { year: day.getUTCFullYear(), month: day.getUTCMonth() + 1, day: day.getUTCDate() };

    for (const slot of windows) {
      if (!slot.days.includes(day.getUTCDay())) continue;

      const length = slot.endMinutes - slot.startMinutes;
      if (minutes && length < minutes) continue;

      const startsAt = zonedToUtc(date, slot.startMinutes, timeZone);
      if (startsAt.getTime() < now + MIN_LEAD_MS) continue;

      candidates.push({
        windowId: slot._id,
        name: slot.name,
        startsAt,
        endsAt: new Date(startsAt.getTime() + length * 60_000),
        minutes: length,
      });
    }
  }

  candidates.sort((a, b) => a.startsAt - b.startsAt);
  return { hasWindows: true, suggestions: candidates.slice(0, MAX_SUGGESTIONS) };
};