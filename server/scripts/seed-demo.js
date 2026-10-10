import { connectDB, disconnectDB } from '../src/config/db.js';
import { Item } from '../src/models/Item.js';
import { User } from '../src/models/User.js';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

const [email, flag] = process.argv.slice(2);

if (!email) {
  console.log('Usage: node scripts/seed-demo.js <email> [--clean]');
  process.exit(1);
}

const rand = (max) => Math.floor(Math.random() * max);
const pick = (list) => list[rand(list.length)];

const PLATFORMS = [
  ['youtube', 'youtube.com', 'video'],
  ['instagram', 'instagram.com', 'video'],
  ['github', 'github.com', 'repo'],
  ['twitter', 'x.com', 'post'],
  ['medium', 'medium.com', 'article'],
];

let counter = 0;

// Inserted straight into the collection so createdAt/completedAt stay exactly as set
const makeItem = (userId, { createdAt, status, completedAt = null, scheduledAt = null }) => {
  counter += 1;
  const [platform, host, contentType] = pick(PLATFORMS);
  const path = `/demo/${Date.now()}-${counter}`;

  return {
    user: userId,
    url: `https://${host}${path}`,
    normalizedUrl: `${host}${path}`,
    platform,
    contentType,
    title: `Demo ${contentType} #${counter}`,
    description: '',
    thumbnail: null,
    durationMinutes: pick([3, 5, 8, 12, 20, 35]),
    author: '',
    metadataStatus: 'done',
    metadataFetchedAt: createdAt,
    notes: '',
    tags: ['demo'],
    status,
    scheduledAt,
    notifiedAt: null,
    completedAt,
    snoozeCount: 0,
    createdAt,
    updatedAt: completedAt ?? createdAt,
    __v: 0,
  };
};

const run = async () => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error(`No user found with email ${email}`);

  const removed = await Item.deleteMany({ user: user._id, tags: 'demo' });
  console.log(`Removed ${removed.deletedCount} old demo items`);

  if (flag === '--clean') return;

  const now = Date.now();
  const docs = [];

  // Finished items over the last 60 days. The last 4 days always have one, so a streak shows up.
  for (let offset = 0; offset < 60; offset += 1) {
    const count = offset < 4 ? 1 + rand(3) : Math.random() < 0.6 ? 1 + rand(3) : 0;

    for (let index = 0; index < count; index += 1) {
      const minutesAgo = offset === 0 ? 5 + rand(30) : 0;
      const completedAt = new Date(now - offset * DAY_MS - rand(3) * HOUR_MS - minutesAgo * 60_000);
      const createdAt = new Date(completedAt.getTime() - (1 + rand(72)) * HOUR_MS);
      docs.push(makeItem(user._id, { createdAt, completedAt, status: 'completed' }));
    }
  }

  // Saved but not finished
  for (let index = 0; index < 25; index += 1) {
    const createdAt = new Date(now - rand(60 * 24) * HOUR_MS);
    docs.push(makeItem(user._id, { createdAt, status: pick(['inbox', 'inbox', 'inbox', 'archived']) }));
  }

  // Two overdue reminders
  for (let index = 0; index < 2; index += 1) {
    docs.push(
      makeItem(user._id, {
        createdAt: new Date(now - 2 * DAY_MS),
        scheduledAt: new Date(now - 2 * HOUR_MS),
        status: 'scheduled',
      })
    );
  }

  await Item.collection.insertMany(docs);
  console.log(`Added ${docs.length} demo items for ${user.email}`);
};

await connectDB();
try {
  await run();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}