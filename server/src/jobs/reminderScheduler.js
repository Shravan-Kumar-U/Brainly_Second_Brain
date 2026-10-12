import { processDueReminders } from '../services/reminder.service.js';

// A reminder fires at most this long after its time, plus the push service's own delivery time
const INTERVAL_MS = 15_000;

let timer = null;
let current = null; // the run in progress, so shutdown can wait for it

const tick = () => {
  if (current) return current; // never let two runs overlap

  current = processDueReminders()
    .catch((error) => console.error('[scheduler] run failed:', error))
    .finally(() => {
      current = null;
    });

  return current;
};

export const startReminderScheduler = () => {
  if (timer) return;
  tick(); // catch up immediately: anything that came due while the server was down
  timer = setInterval(tick, INTERVAL_MS);
  console.log(`Reminder scheduler running (every ${INTERVAL_MS / 1000}s)`);
};

export const stopReminderScheduler = async () => {
  clearInterval(timer);
  timer = null;
  await current;
};