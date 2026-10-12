import webpush from 'web-push';

import { env } from '../config/env.js';
import { PushSubscription } from '../models/PushSubscription.js';

webpush.setVapidDetails(env.vapid.subject, env.vapid.publicKey, env.vapid.privateKey);

const MAX_DEVICES_PER_USER = 10;
const SEND_TIMEOUT_MS = 10_000;
const DEFAULT_TTL_SECONDS = 6 * 60 * 60; // if the device is offline, drop the reminder after 6 hours
const GONE_STATUSES = new Set([404, 410]); // the device unsubscribed or uninstalled

const upsert = ({ userId, endpoint, keys, userAgent }) =>
  PushSubscription.findOneAndUpdate(
    { endpoint },
    { $set: { user: userId, keys, userAgent } },
    { upsert: true, setDefaultsOnInsert: true }
  );

export const saveSubscription = async (userId, { endpoint, keys }, userAgent) => {
  const data = { userId, endpoint, keys, userAgent };

  try {
    await upsert(data);
  } catch (error) {
    // Two identical requests racing can both try to insert; the second simply retries as an update
    if (error.code !== 11000) throw error;
    await upsert(data);
  }

  // Keep the newest devices only
  const stale = await PushSubscription.find({ user: userId })
    .sort({ updatedAt: -1 })
    .skip(MAX_DEVICES_PER_USER)
    .select('_id')
    .lean();

  if (stale.length > 0) {
    await PushSubscription.deleteMany({ _id: { $in: stale.map((entry) => entry._id) } });
  }
};

export const removeSubscription = (userId, endpoint) =>
  PushSubscription.deleteOne({ user: userId, endpoint });

export const countDevices = (userId) => PushSubscription.countDocuments({ user: userId });

// Returns 'delivered' | 'gone' | 'transient' | 'rejected'
const sendOne = async (subscription, body, options) => {
  const target = { endpoint: subscription.endpoint, keys: subscription.keys };
  const host = new URL(subscription.endpoint).hostname;

  try {
    await webpush.sendNotification(target, body, options);
    return 'delivered';
  } catch (error) {
    const status = error.statusCode;

    if (GONE_STATUSES.has(status)) {
      await PushSubscription.deleteOne({ _id: subscription._id });
      return 'gone';
    }

    // No status means a network error or timeout. 429 and 5xx mean the service is struggling.
    if (!status || status === 429 || status >= 500) {
      console.warn(`[push] temporary failure for ${host}: ${error.message}`);
      return 'transient';
    }

    // 401/403 usually means the device was subscribed with a different VAPID key.
    // We keep the subscription: the app replaces it the next time it opens.
    console.warn(`[push] rejected (${status}) by ${host}`);
    return 'rejected';
  }
};

export const sendToUser = async (userId, payload, { ttl = DEFAULT_TTL_SECONDS, topic } = {}) => {
  const subscriptions = await PushSubscription.find({ user: userId }).lean();
  const tally = { devices: subscriptions.length, delivered: 0, transient: 0, gone: 0, rejected: 0 };
  if (subscriptions.length === 0) return tally;

  const options = {
    TTL: ttl,
    urgency: 'high', // lets Android deliver even while the phone is dozing
    timeout: SEND_TIMEOUT_MS,
    ...(topic && { topic }), // a newer message with the same topic replaces an undelivered older one
  };
  const body = JSON.stringify(payload);

  const outcomes = await Promise.all(
    subscriptions.map((subscription) => sendOne(subscription, body, options))
  );
  for (const outcome of outcomes) tally[outcome] += 1;

  return tally;
};

// Lets you press "Test", switch away from the app, and watch the notification arrive
export const sendTestLater = (userId, delayMs = 5000) => {
  setTimeout(() => {
    sendToUser(
      userId,
      {
        title: 'Brainly is ready',
        body: 'Reminders work on this device.',
        tag: 'brainly-test',
        url: '/',
        timestamp: Date.now(),
      },
      { ttl: 120 }
    ).catch((error) => console.error('[push] test failed:', error.message));
  }, delayMs).unref();
};