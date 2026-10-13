import { processDueReminders } from '../services/reminder.service.js';
import { processWeeklyReviews } from '../services/weeklyReview.service.js';

const INTERVAL_MS = 15_000; // reminders are checked this often
const REVIEW_CHECK_MS = 10 * 60 * 1000; // weekly reviews only need a check every 10 minutes

let timer = null;
let current = null; // the run in progress, so shutdown can wait for it
let lastReviewCheck = 0;

const run = async () => {
  await processDueReminders();

  if (Date.now() - lastReviewCheck >= REVIEW_CHECK_MS) {
    lastReviewCheck = Date.now();
    await processWeeklyReviews();
  }
};

const tick = () => {
  if (current) return current; // never let two runs overlap

  current = run()
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