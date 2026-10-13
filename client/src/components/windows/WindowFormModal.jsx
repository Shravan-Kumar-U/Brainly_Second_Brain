import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useWindowActions } from '@/hooks/useWindows';
import { cn } from '@/lib/cn';
import { DAYS, inputToMinutes, minutesToInput } from '@/lib/windows';

const timeInputClass =
  'h-11 w-full rounded-xl border bg-surface px-3 text-base text-fg transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 sm:text-sm';

// Its own component, so the fields reset every time the dialog opens
function FormBody({ window: slot, onDone }) {
  const actions = useWindowActions();
  const mutation = slot ? actions.update : actions.create;

  const [name, setName] = useState(slot?.name ?? '');
  const [days, setDays] = useState(slot?.days ?? [1, 2, 3, 4, 5]);
  const [start, setStart] = useState(minutesToInput(slot?.startMinutes ?? 480));
  const [end, setEnd] = useState(minutesToInput(slot?.endMinutes ?? 540));

  const startMinutes = inputToMinutes(start);
  const endMinutes = inputToMinutes(end);
  const rangeValid = startMinutes !== null && endMinutes !== null && endMinutes > startMinutes;
  const canSave = name.trim() && days.length > 0 && rangeValid;

  const toggleDay = (id) =>
    setDays((previous) => (previous.includes(id) ? previous.filter((day) => day !== id) : [...previous, id]));

  const submit = (event) => {
    event.preventDefault();
    if (!canSave) return;

    const data = { name: name.trim(), days, startMinutes, endMinutes };
    mutation.mutate(slot ? { id: slot._id, data } : data, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Name"
        placeholder="e.g. Commute"
        maxLength={40}
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium">Days</p>
        <div className="flex gap-1.5" role="group" aria-label="Days">
          {DAYS.map((day) => {
            const active = days.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                aria-pressed={active}
                aria-label={day.name}
                onClick={() => toggleDay(day.id)}
                className={cn(
                  'grid size-10 flex-1 place-items-center rounded-xl border text-sm font-semibold transition sm:size-11 sm:flex-none',
                  active ? 'border-brand-600 bg-brand-600 text-white' : 'bg-surface text-fg-muted hover:bg-surface-2'
                )}
              >
                {day.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="window-start" className="mb-1.5 block text-sm font-medium">
            From
          </label>
          <input id="window-start" type="time" value={start} onChange={(event) => setStart(event.target.value)} className={timeInputClass} />
        </div>
        <div>
          <label htmlFor="window-end" className="mb-1.5 block text-sm font-medium">
            Until
          </label>
          <input
            id="window-end"
            type="time"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            aria-invalid={!rangeValid}
            className={cn(timeInputClass, !rangeValid && 'border-red-500')}
          />
        </div>
      </div>
      {!rangeValid && (
        <p role="alert" className="-mt-2 text-xs text-red-600 dark:text-red-400">
          The end time must be after the start time, on the same day.
        </p>
      )}

      <Button type="submit" fullWidth loading={mutation.isPending} disabled={!canSave}>
        {slot ? 'Save changes' : 'Add window'}
      </Button>
    </form>
  );
}

export function WindowFormModal({ open, onClose, window: slot }) {
  return (
    <Modal open={open} onClose={onClose} title={slot ? 'Edit watch window' : 'New watch window'}>
      <FormBody window={slot} onDone={onClose} />
    </Modal>
  );
}