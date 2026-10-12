import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startReminderScheduler, stopReminderScheduler } from './jobs/reminderScheduler.js';

const start = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`Brainly API running on port ${env.port} (${env.nodeEnv})`);
  });

  startReminderScheduler();

  // Graceful shutdown: finish in-flight requests and the current reminder run, then close the DB
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await stopReminderScheduler();
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    server.close(() => process.exit(1));
  });
};

start();