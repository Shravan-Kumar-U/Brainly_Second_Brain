import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import {
  availablePresets,
  formatWhen,
  isPastDate,
  parseLocalInput,
  toLocalInputValue,
} from '@/lib/time';

export function SchedulePicker({ value, onChange }) {
  const inputId = useId();
  const [activeId, setActiveId] = useState(null);

  const presets = availablePresets();
  const inPast = value ? isPastDate(value) : false;

  const choosePreset = (preset) => {
    setActiveId(preset.id);
    onChange(preset.resolve()); // resolved at click time, so "In 1 hour" is always accurate
  };

  const handleCustom = (event) => {
    const date = parseLocalInput(event.target.value);
    setActiveId(date ? 'custom' : null);
    onChange(date);
  };

  const clear = () => {
    setActiveId(null);
    onChange(null);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {presets.map((preset) => {
          const active = activeId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => choosePreset(preset)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition',
                active
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'bg-surface hover:bg-surface-2'
              )}
            >
              <span className="block text-sm font-semibold">{preset.label}</span>
              <span className="block text-xs text-fg-muted">{formatWhen(preset.resolve())}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-fg-muted">
          Or pick a date and time
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="datetime-local"
            min={toLocalInputValue(new Date())}
            value={value ? toLocalInputValue(value) : ''}
            onChange={handleCustom}
            aria-invalid={inPast}
            className={cn(
              'h-11 min-w-0 flex-1 rounded-xl border bg-surface px-3 text-base text-fg transition sm:text-sm',
              'focus:outline-none focus:ring-4',
              inPast
                ? 'border-red-500 focus:ring-red-500/15'
                : 'focus:border-brand-500 focus:ring-brand-500/15'
            )}
          />
          {value && (
            <Button variant="ghost" onClick={clear}>
              Clear
            </Button>
          )}
        </div>
        {inPast && (
          <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            Pick a time in the future.
          </p>
        )}
      </div>
    </div>
  );
}