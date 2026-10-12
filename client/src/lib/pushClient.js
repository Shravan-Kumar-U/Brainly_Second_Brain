import { pushApi } from '@/api/push.api';
import { isIos, isStandalone } from './platform';

export const isPushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const urlBase64ToBytes = (value) => {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const sameKey = (buffer, bytes) => {
  if (!buffer) return false;
  const existing = new Uint8Array(buffer);
  return existing.length === bytes.length && existing.every((value, index) => value === bytes[index]);
};

// Resolves to undefined (instead of waiting forever) when no service worker exists, e.g. `npm run dev`
const getRegistration = async () => {
  try {
    return (await navigator.serviceWorker.getRegistration()) ?? null;
  } catch {
    return null;
  }
};

const readyRegistration = async () => {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
  ]);

  if (!registration) {
    throw new Error('Reminders need the installed app or the built version (not npm run dev).');
  }
  return registration;
};

// Creates the browser subscription if needed and tells the server about it
const subscribeThisDevice = async () => {
  const registration = await readyRegistration();
  const keyBytes = urlBase64ToBytes(await pushApi.getPublicKey());

  let subscription = await registration.pushManager.getSubscription();

  // A subscription made with an older server key can never receive our messages
  if (subscription && !sameKey(subscription.options?.applicationServerKey, keyBytes)) {
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes,
    });
  }

  await pushApi.subscribe(subscription.toJSON());
};

const currentSubscription = async () => {
  try {
    const registration = await getRegistration();
    return registration ? await registration.pushManager.getSubscription() : null;
  } catch {
    return null;
  }
};

export const pushClient = {
  // 'needs-install' | 'unsupported' | 'blocked' | 'off' | 'on'
  async detect() {
    if (isIos() && !isStandalone()) return 'needs-install'; // iPhones allow push only for home-screen apps
    if (!isPushSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'blocked';
    if (Notification.permission === 'granted') return (await currentSubscription()) ? 'on' : 'off';
    return 'off';
  },

  async enable() {
    if (!isPushSupported()) throw new Error('This browser does not support notifications.');

    // Must be the first thing awaited, so the browser still counts it as a response to the tap
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return; // dismissed or blocked; detect() reports which

    await subscribeThisDevice();
  },

  async disable() {
    const subscription = await currentSubscription();
    if (!subscription) return;

    await pushApi.unsubscribe(subscription.endpoint).catch(() => {});
    await subscription.unsubscribe();
  },

  // Called every time the app opens: heals a subscription the server lost or the browser replaced
  async sync() {
    if (!isPushSupported() || Notification.permission !== 'granted') return;
    if (!(await getRegistration())?.active) return;
    if (!(await currentSubscription())) return;

    await subscribeThisDevice();
  },

  // Used by logout. A local lookup, so it never hangs.
  async getEndpoint() {
    return (await currentSubscription())?.endpoint ?? null;
  },
};