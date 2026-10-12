import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Any page navigation gets the app shell, even offline. React Router draws the right screen.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// Sent by the "Update" button so a new version takes over only when the user asks
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ---------- Push notifications ---------- */

// The service worker can't read localStorage, so the API address is baked in at build time
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

const ICON = '/icons/icon-192.png';
const BADGE = '/icons/badge-96.png';
const CONFIRM_TAG = 'brainly-confirm';

const DONE_COPY = { complete: 'Marked as done', snooze: 'Snoozed for 1 hour' };

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { body: event.data?.text() };
  }

  // Browsers require every push to show a notification, so we always show something
  event.waitUntil(
    self.registration.showNotification(data.title || 'Brainly', {
      body: data.body,
      icon: ICON,
      badge: BADGE,
      tag: data.tag,
      renotify: Boolean(data.tag), // alert again if a notification with this tag is replaced
      timestamp: data.timestamp,
      vibrate: [120, 60, 120],
      actions: data.actions ?? [],
      data: { url: data.url ?? '/', actionToken: data.actionToken },
    })
  );
});

const openApp = async (path) => {
  const target = new URL(path || '/', self.location.origin).href;
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  for (const client of windows) {
    if (new URL(client.url).origin !== self.location.origin) continue;
    await client.focus();
    if ('navigate' in client) {
      try {
        await client.navigate(target);
      } catch {
        /* focusing was enough */
      }
    }
    return;
  }

  await self.clients.openWindow(target);
};

// Tells the user the button worked, then removes the message again
const flash = async (title) => {
  await self.registration.showNotification(title, {
    tag: CONFIRM_TAG,
    icon: ICON,
    badge: BADGE,
    silent: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const shown = await self.registration.getNotifications({ tag: CONFIRM_TAG });
  shown.forEach((notification) => notification.close());
};

const runAction = async (action, token, fallbackUrl) => {
  try {
    const response = await fetch(`${API_URL}/push/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    await flash(DONE_COPY[action]);
  } catch {
    await self.registration.showNotification("Couldn't update that item", {
      body: 'Tap to open Brainly.',
      tag: CONFIRM_TAG,
      icon: ICON,
      badge: BADGE,
      data: { url: fallbackUrl },
    });
  }
};

self.addEventListener('notificationclick', (event) => {
  const { action } = event;
  const { url, actionToken } = event.notification.data ?? {};
  event.notification.close();

  const isButton = action === 'complete' || action === 'snooze';

  if (isButton && actionToken && API_URL) {
    event.waitUntil(runAction(action, actionToken, url));
  } else {
    event.waitUntil(openApp(url));
  }
});