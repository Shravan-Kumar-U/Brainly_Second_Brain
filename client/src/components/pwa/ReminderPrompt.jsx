import { BellRing, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePush } from '@/hooks/usePush';
import { useToast } from '@/hooks/useToast';

const DISMISSED_KEY = 'brainly.reminderPromptDismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
};

export function ReminderPrompt() {
  const { status, busy, enable } = usePush();
  const toast = useToast();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (status !== 'off' || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* storage unavailable: it just returns next visit */
    }
  };

  const turnOn = async () => {
    try {
      const next = await enable();
      if (next === 'on') toast.success('Reminders are on');
      else if (next === 'blocked') toast.error('Notifications are blocked in your browser settings');
    } catch (error) {
      toast.error(error.message || 'Could not turn on reminders');
    }
  };

  return (
    <Card className="flex items-center gap-4 border-brand-500/30 bg-brand-500/5 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
        <BellRing className="size-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Get reminded on time</p>
        <p className="mt-0.5 text-xs text-fg-muted">
          Turn on notifications so Brainly can nudge you when it’s time to watch.
        </p>
      </div>

      <Button size="sm" loading={busy} onClick={turnOn}>
        Turn on
      </Button>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-2 hover:text-fg"
      >
        <X className="size-4" aria-hidden />
      </button>
    </Card>
  );
}