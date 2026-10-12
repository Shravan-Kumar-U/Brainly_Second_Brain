import { z } from 'zod';

// The push services run by the browser vendors. Our server sends a request to whatever
// endpoint is stored, so anything else would let a user aim it at an internal address.
const PUSH_HOSTS = [
  'fcm.googleapis.com', // Chrome, Edge, Brave, Samsung Internet
  'push.services.mozilla.com', // Firefox
  'push.apple.com', // Safari
  'notify.windows.com', // legacy Edge
];

const isPushEndpoint = (value) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    return (
      url.protocol === 'https:' &&
      !url.port &&
      !url.username &&
      !url.password &&
      PUSH_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
    );
  } catch {
    return false;
  }
};

const endpoint = z.string().trim().max(2048).refine(isPushEndpoint, 'Unsupported push service');
const base64Url = (max) => z.string().min(1).max(max).regex(/^[\w-]+$/, 'Invalid key');

export const subscribeSchema = z.object({
  endpoint,
  keys: z.object({ p256dh: base64Url(200), auth: base64Url(100) }),
});

export const unsubscribeSchema = z.object({ endpoint });

export const actionSchema = z.object({
  token: z.string().min(1).max(2000),
  action: z.enum(['complete', 'snooze']),
});