import { Bell, BellOff, BellRing, Send, Smartphone } from 'lucide-react';
import { useState } from 'react';

import { pushApi } from '@/api/push.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePush } from '@/hooks/usePush';
import { useToast } from '@/hooks/useToast';

const COPY = {
  unsupported: {
    icon: BellOff,
    title: 'Not supported here',
    body: 'This browser can’t receive push notifications. Try Chrome on Android, or install Brainly from your browser menu.',
  },
  'needs-install': {
    icon: Smartphone,
    title: 'Add Brainly to your Home Screen first',
    body: 'On iPhone, notifications only work for installed apps. Tap Share, then “Add to Home Screen”, and open Brainly from there.',
  },
  blocked: {
    icon: BellOff,
    title: 'Notifications are blocked',
    body: 'Allow them in your browser’s site settings for Brainly (on Android: long-press the app icon → App info → Notifications), then come back here.',
  },
  off: {
    icon: Bell,
    title: 'Reminders are off',
    body: 'Turn them on so Brainly can remind you at the time you picked, even when the app is closed.',
  },
  on: {
    icon: BellRing,
    title: 'Reminders are on for this device',
    body: 'You’ll get a notification at the time you chose, with Done and Snooze buttons.',
  },
};

export function NotificationSettings() {
  const { status, busy, enable, disable } = usePush();
  const toast = useToast();
  const [testing, setTesting] = useState(false);

  const handle = async (task) => {
    try {
      return await task();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      return null;
    }
  };

  const turnOn = async () => {
    const next = await handle(enable);
    if (next === 'on') toast.success('Reminders are on');
    else if (next === 'blocked') toast.error('Notifications are blocked in your browser settings');
  };

  const turnOff = async () => {
    if ((await handle(disable)) === 'off') toast.info('Reminders turned off for this device');
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      await pushApi.test();
      toast.info('Test sent. Switch away from Brainly now. It arrives in about 5 seconds.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTesting(false);
    }
  };

  if (status === 'checking') return <Skeleton className="h-40 rounded-2xl" />;

  const { icon: Icon, title, body } = COPY[status];

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{body}</p>
        </div>
      </div>

      {status === 'off' && (
        <Button className="mt-5" loading={busy} onClick={turnOn}>
          Turn on reminders
        </Button>
      )}

      {status === 'on' && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" loading={testing} onClick={sendTest}>
            <Send className="size-4" aria-hidden />
            Send a test (5 s)
          </Button>
          <Button variant="ghost" loading={busy} onClick={turnOff}>
            Turn off
          </Button>
        </div>
      )}
    </Card>
  );
}