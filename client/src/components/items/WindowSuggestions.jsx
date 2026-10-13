import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { useWindowSuggestions } from '@/hooks/useWindows';
import { cn } from '@/lib/cn';
import { formatWhen } from '@/lib/time';

export function WindowSuggestions({ minutes, value, onPick }) {
  const { data } = useWindowSuggestions(minutes);
  if (!data) return null;

  if (!data.hasWindows) {
    return (
      <p className="mb-4 text-xs text-fg-subtle">
        Tip: add{' '}
        <Link to="/settings" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          watch windows
        </Link>{' '}
        and Brainly will suggest the right moment for each link.
      </p>
    );
  }

  if (data.suggestions.length === 0) {
    return (
      <p className="mb-4 text-xs text-fg-subtle">
        None of your watch windows is long enough for this one{minutes ? ` (${minutes} min)` : ''}.
      </p>
    );
  }

  return (
    <div className="mb-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
        <Sparkles className="size-3.5 text-brand-500" aria-hidden />
        Fits your routine
      </p>

      <div className="grid gap-2 sm:grid-cols-3">
        {data.suggestions.map((suggestion) => {
          const start = new Date(suggestion.startsAt);
          const active = value?.getTime() === start.getTime();

          return (
            <button
              key={`${suggestion.windowId}-${suggestion.startsAt}`}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(start)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition',
                active ? 'border-brand-500 bg-brand-500/10' : 'bg-surface hover:bg-surface-2'
              )}
            >
              <span className="block truncate text-sm font-semibold">{suggestion.name}</span>
              <span className="block text-xs text-fg-muted">{formatWhen(start)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}