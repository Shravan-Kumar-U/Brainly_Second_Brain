import { ITEM_STATUS } from '../constants/item.constants.js';
import { Item } from '../models/Item.js';

const DAY_MS = 86_400_000;
const CHART_DAYS = 91; // 13 full weeks, for the heatmap
const STREAK_LOOKBACK_DAYS = 365;

const safeTimezone = (timeZone) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
};

// The en-CA locale formats dates as YYYY-MM-DD
const dayKey = (date, timeZone) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

// Calendar arithmetic on "YYYY-MM-DD" strings. UTC is used purely as a calculator here,
// so daylight saving can never skip or repeat a day.
const shiftDay = (key, delta) =>
  new Date(new Date(`${key}T00:00:00Z`).getTime() + delta * DAY_MS).toISOString().slice(0, 10);

const lastDays = (count, todayKey) =>
  Array.from({ length: count }, (_, index) => shiftDay(todayKey, index - (count - 1)));

// Groups items by the local calendar day of a date field
const countByDay = async (userId, field, lookbackDays, timeZone) => {
  const since = new Date(Date.now() - (lookbackDays + 1) * DAY_MS); // one spare day; extra keys are ignored

  const rows = await Item.aggregate([
    { $match: { user: userId, [field]: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: `$${field}`, timezone: timeZone } },
        count: { $sum: 1 },
        minutes: { $sum: { $ifNull: ['$durationMinutes', 0] } },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id, row]));
};

const computeStreaks = (doneDays, todayKey) => {
  // Current: counts back from today, or from yesterday if today has nothing yet
  let cursor = doneDays.has(todayKey) ? todayKey : shiftDay(todayKey, -1);
  let current = 0;
  while (doneDays.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  // Longest: walk the days in order, extending the run whenever the previous day is present
  let longest = 0;
  let run = 0;
  for (const key of [...doneDays].sort()) {
    run = doneDays.has(shiftDay(key, -1)) ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  return { current, longest };
};

const getSummary = async (userId) => {
  const [byStatus, overdue] = await Promise.all([
    Item.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Item.countDocuments({
      user: userId,
      status: ITEM_STATUS.SCHEDULED,
      scheduledAt: { $lte: new Date() },
    }),
  ]);

  const counts = Object.fromEntries(byStatus.map((row) => [row._id, row.count]));
  const completed = counts[ITEM_STATUS.COMPLETED] ?? 0;
  const archived = counts[ITEM_STATUS.ARCHIVED] ?? 0;
  const active = (counts[ITEM_STATUS.INBOX] ?? 0) + (counts[ITEM_STATUS.SCHEDULED] ?? 0);
  const total = completed + archived + active;
  const considered = completed + active; // archived items were let go on purpose

  return {
    total,
    completed,
    active,
    archived,
    overdue,
    finishRate: considered ? Math.round((completed / considered) * 100) : 0,
  };
};

const getPlatforms = (userId) =>
  Item.aggregate([
    { $match: { user: userId, status: { $ne: ITEM_STATUS.ARCHIVED } } },
    {
      $group: {
        _id: '$platform',
        saved: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', ITEM_STATUS.COMPLETED] }, 1, 0] } },
      },
    },
    { $sort: { saved: -1, _id: 1 } },
    { $limit: 6 },
    { $project: { _id: 0, platform: '$_id', saved: 1, completed: 1 } },
  ]);

export const getInsights = async (user) => {
  const userId = user._id;
  const timeZone = safeTimezone(user.timezone);
  const today = dayKey(new Date(), timeZone);

  const [summary, platforms, completedByDay, savedByDay] = await Promise.all([
    getSummary(userId),
    getPlatforms(userId),
    countByDay(userId, 'completedAt', STREAK_LOOKBACK_DAYS, timeZone),
    countByDay(userId, 'createdAt', CHART_DAYS, timeZone),
  ]);

  const daily = lastDays(CHART_DAYS, today).map((date) => ({
    date,
    saved: savedByDay.get(date)?.count ?? 0,
    completed: completedByDay.get(date)?.count ?? 0,
    minutes: completedByDay.get(date)?.minutes ?? 0,
  }));

  return {
    timezone: timeZone,
    today,
    summary,
    streak: computeStreaks(new Set(completedByDay.keys()), today),
    daily,
    platforms,
  };
};