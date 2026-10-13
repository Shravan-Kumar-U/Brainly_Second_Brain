const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatters = new Map(); // building a formatter is slow, so each timezone gets one

const formatterFor = (timeZone) => {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(timeZone, formatter); // only reached for valid timezones
  }
  return formatter;
};

export const isValidTimezone = (timeZone) => {
  if (typeof timeZone !== 'string' || !timeZone) return false;
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
};

export const safeTimezone = (timeZone) => (isValidTimezone(timeZone) ? timeZone : 'UTC');

// What the wall clock says in that timezone at that moment
export const localParts = (date, timeZone) => {
  const parts = formatterFor(timeZone).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;

  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));

  return {
    year,
    month,
    day,
    hour: Number(get('hour')) % 24,
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: WEEKDAYS.indexOf(get('weekday')), // 0 = Sunday
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
};

const offsetMs = (instant, timeZone) => {
  const p = localParts(instant, timeZone);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asIfUtc - Math.floor(instant.getTime() / 1000) * 1000;
};

// "8:00 AM on this calendar day, in this timezone" → the real moment in time.
// The second pass corrects the guess when the offset changes (daylight saving).
export const zonedToUtc = ({ year, month, day }, minutesOfDay, timeZone) => {
  const naive = Date.UTC(year, month - 1, day, 0, minutesOfDay);
  const first = naive - offsetMs(new Date(naive), timeZone);
  return new Date(naive - offsetMs(new Date(first), timeZone));
};