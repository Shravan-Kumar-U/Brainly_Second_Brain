import { useRegisterSW } from 'virtual:pwa-register/react';

import { Button } from '@/components/ui/Button';

const HOUR_MS = 60 * 60 * 1000;

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // An installed app can stay open for days, so we check for a new version every hour
      if (registration) {
        setInterval(() => {
          if (navigator.onLine) registration.update();
        }, HOUR_MS);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 lg:bottom-6"
    >
      <div className="flex w-full max-w-md animate-fade-in items-center gap-3 rounded-2xl border bg-surface p-4 shadow-xl">
        <p className="flex-1 text-sm font-medium">A new version of Brainly is ready.</p>
        <Button variant="ghost" size="sm" onClick={() => setNeedRefresh(false)}>
          Later
        </Button>
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          Update
        </Button>
      </div>
    </div>
  );
}