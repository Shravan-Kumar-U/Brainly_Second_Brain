const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Whole calendar days between now and date (rounded, so daylight saving can't skew it)
const dayOffset = (date) => Math.round((startOfDay(date) - startOfDay(new Date())) / DAY);

// "8 PM, N days from today" in local time
const at = (daysFromToday, hour, minute = 0) => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysFromToday,
    hour,
    minute,
    0,
    0
  );
};

export const formatDayLabel = (value) => {
  const date = new Date(value);
  const offset = dayOffset(date);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === -1) return 'Yesterday';
  return dayFormat.format(date);
};

export const formatWhen = (value) => {
  const date = new Date(value);
  return `${formatDayLabel(date)}, ${timeFormat.format(date)}`;
};

// "in 25 min", "3 h ago", "in 2 d"
export const formatRelative = (value, now = Date.now()) => {
  const diff = new Date(value).getTime() - now;
  const abs = Math.abs(diff);

  if (abs < MINUTE) return 'now';

  let text;
  if (abs < HOUR) text = `${Math.round(abs / MINUTE)} min`;
  else if (abs < DAY) text = `${Math.round(abs / HOUR)} h`;
  else text = `${Math.round(abs / DAY)} d`;

  return diff > 0 ? `in ${text}` : `${text} ago`;
};

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)}h${rest ? ` ${rest}m` : ''}`;
};

export const isPastDate = (date) => date.getTime() <= Date.now();

const pad = (number) => String(number).padStart(2, '0');

// <input type="datetime-local"> speaks "YYYY-MM-DDTHH:mm" in local time
export const toLocalInputValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const parseLocalInput = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const nextSaturday = () => {
  const ahead = (6 - new Date().getDay() + 7) % 7;
  const candidate = at(ahead, 10);
  return candidate.getTime() < Date.now() + 30 * MINUTE ? at(ahead + 7, 10) : candidate;
};

export const SCHEDULE_PRESETS = [
  { id: 'hour', label: 'In 1 hour', resolve: () => new Date(Date.now() + HOUR) },
  { id: 'three-hours', label: 'In 3 hours', resolve: () => new Date(Date.now() + 3 * HOUR) },
  {
    id: 'tonight',
    label: 'Tonight',
    resolve: () => at(0, 20),
    available: () => at(0, 20).getTime() > Date.now() + 30 * MINUTE,
  },
  { id: 'tomorrow-morning', label: 'Tomorrow morning', resolve: () => at(1, 8) },
  { id: 'tomorrow-evening', label: 'Tomorrow evening', resolve: () => at(1, 20) },
  { id: 'weekend', label: 'Weekend', resolve: nextSaturday },
];

export const availablePresets = () =>
  SCHEDULE_PRESETS.filter((preset) => preset.available?.() ?? true);

const minutesUntil = (date) => Math.max(5, Math.ceil((date.getTime() - Date.now()) / MINUTE));

// The server accepts snoozes of 5 minutes to 7 days
export const SNOOZE_OPTIONS = [
  { id: '15m', label: 'In 15 minutes', minutes: () => 15 },
  { id: '1h', label: 'In 1 hour', minutes: () => 60 },
  { id: '3h', label: 'In 3 hours', minutes: () => 180 },
  { id: 'tomorrow', label: 'Tomorrow morning', minutes: () => minutesUntil(at(1, 8)) },
];

export const FIT_OPTIONS = [5, 15, 30, 60];