import { WifiOff } from 'lucide-react';

import { Button } from './Button';

export function ConnectionError({ onRetry }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-xs text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-2 text-fg-muted">
          <WifiOff className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-lg font-semibold">Can't reach Brainly</h1>
        <p className="mt-1.5 text-sm text-fg-muted">
          Check your internet connection and try again. Your saved items are safe.
        </p>
        <Button className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}