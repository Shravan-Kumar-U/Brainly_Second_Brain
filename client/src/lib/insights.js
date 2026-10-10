const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

// "2026-10-10" → a local Date (the key is already the user's calendar day)
const parseDayKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDayKey = (key) => dayFormat.format(parseDayKey(key));

// Monday = 0 … Sunday = 6, so heatmap rows read Mon→Sun
export const mondayIndex = (key) => (parseDayKey(key).getDay() + 6) % 7;

export const sumBy = (days, field) => days.reduce((total, day) => total + day[field], 0);