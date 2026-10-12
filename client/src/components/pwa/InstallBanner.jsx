import { Download, Share, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstall } from '@/hooks/useInstall';

const DISMISSED_KEY = 'brainly.installDismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
};

export function InstallBanner() {
  const { canInstall, showIosGuide, install } = useInstall();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed || (!canInstall && !showIosGuide)) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* storage unavailable: the banner just returns next visit */
    }
  };

  return (
    <Card className="flex items-center gap-4 border-brand-500/30 bg-brand-500/5 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
        <Download className="size-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Install Brainly</p>
        {canInstall ? (
          <p className="mt-0.5 text-xs text-fg-muted">
            Open it from your home screen and share links straight from YouTube and more.
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-fg-muted">
            Tap <Share className="mx-0.5 inline size-3.5 align-text-bottom" aria-hidden />
            <span className="font-medium"> Share</span>, then{' '}
            <span className="font-medium">Add to Home Screen</span>.
          </p>
        )}
      </div>

      {canInstall && (
        <Button size="sm" onClick={install}>
          Install
        </Button>
      )}

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