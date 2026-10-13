import { Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWatchWindows, useWindowActions } from '@/hooks/useWindows';
import { WINDOW_PRESETS, formatDays, formatMinutes } from '@/lib/windows';
import { WindowFormModal } from './WindowFormModal';

const MAX_WINDOWS = 10;

const describe = (slot) =>
  `${formatDays(slot.days)} · ${formatMinutes(slot.startMinutes)} to ${formatMinutes(slot.endMinutes)}`;

export function WindowsSettings() {
  const { data: windows, isPending, error } = useWatchWindows();
  const actions = useWindowActions();
  const [editing, setEditing] = useState(null); // null | 'new' | a window

  if (isPending) return <Skeleton className="h-44 rounded-2xl" />;
  if (error) return <Alert>{error.message}</Alert>;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
          <Clock className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold">When do you usually have time?</h2>
          <p className="mt-1 text-sm text-fg-muted">
            When you schedule a link, Brainly suggests the next window that is long enough for it.
          </p>
        </div>
      </div>

      {windows.length > 0 && (
        <ul className="mt-4 divide-y rounded-xl border">
          {windows.map((slot) => (
            <li key={slot._id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{slot.name}</p>
                <p className="text-xs text-fg-muted">
                  {describe(slot)} ({slot.endMinutes - slot.startMinutes} min)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(slot)}
                aria-label={`Edit ${slot.name}`}
                className="grid size-9 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-2 hover:text-fg"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                disabled={actions.remove.isPending}
                onClick={() => actions.remove.mutate(slot._id)}
                aria-label={`Delete ${slot.name}`}
                className="grid size-9 place-items-center rounded-lg text-fg-subtle transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {windows.length === 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-fg-muted">Start with one of these:</p>
          <div className="flex flex-wrap gap-2">
            {WINDOW_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                disabled={actions.create.isPending}
                onClick={() => actions.create.mutate(preset)}
                className="rounded-xl border px-3 py-2 text-left transition hover:bg-surface-2 disabled:opacity-60"
              >
                <span className="block text-sm font-semibold">+ {preset.name}</span>
                <span className="block text-xs text-fg-muted">{describe(preset)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        className="mt-4"
        variant="secondary"
        disabled={windows.length >= MAX_WINDOWS}
        onClick={() => setEditing('new')}
      >
        <Plus className="size-4" aria-hidden />
        Add a window
      </Button>

      <WindowFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        window={editing && editing !== 'new' ? editing : null}
      />
    </Card>
  );
}