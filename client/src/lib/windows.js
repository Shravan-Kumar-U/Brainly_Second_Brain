const clockFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const pad = (number) => String(number).padStart(2, '0');

// Monday first, because that is how people read a week. `id` matches the server (0 = Sunday).
export const DAYS = [
  { id: 1, short: 'M', name: 'Monday' },
  { id: 2, short: 'T', name: 'Tuesday' },
  { id: 3, short: 'W', name: 'Wednesday' },
  { id: 4, short: 'T', name: 'Thursday' },
  { id: 5, short: 'F', name: 'Friday' },
  { id: 6, short: 'S', name: 'Saturday' },
  { id: 0, short: 'S', name: 'Sunday' },
];

export const formatMinutes = (minutes) =>
  clockFormat.format(new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60));

// <input type="time"> speaks "HH:mm"
export const minutesToInput = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const inputToMinutes = (value) => {
  const [hours, minutes] = value.split(':').map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes) ? null : hours * 60 + minutes;
};

export const formatDays = (days) => {
  const key = [...days].sort((a, b) => a - b).join(',');
  if (days.length === 7) return 'Every day';
  if (key === '1,2,3,4,5') return 'Weekdays';
  if (key === '0,6') return 'Weekends';
  return DAYS.filter((day) => days.includes(day.id))
    .map((day) => day.name.slice(0, 3))
    .join(', ');
};

export const WINDOW_PRESETS = [
  { name: 'Commute', days: [1, 2, 3, 4, 5], startMinutes: 480, endMinutes: 540 },
  { name: 'Lunch break', days: [1, 2, 3, 4, 5], startMinutes: 780, endMinutes: 810 },
  { name: 'Evening wind-down', days: [0, 1, 2, 3, 4, 5, 6], startMinutes: 1260, endMinutes: 1320 },
  { name: 'Weekend morning', days: [0, 6], startMinutes: 540, endMinutes: 660 },
];