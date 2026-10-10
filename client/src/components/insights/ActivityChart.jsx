import { useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatDayKey, sumBy } from '@/lib/insights';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

const barHeight = (value, max) => (value ? `${Math.max(4, (value / max) * 100)}%` : '0%');

export function ActivityChart({ daily }) {
  const [range, setRange] = useState(30);

  const days = daily.slice(-range);
  const max = Math.max(1, ...days.flatMap((day) => [day.saved, day.completed]));
  const saved = sumBy(days, 'saved');
  const completed = sumBy(days, 'completed');

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Saved vs finished</h2>
          <p className="mt-0.5 text-xs text-fg-muted">
            {completed} finished, {saved} saved in the last {range} days
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((option) => (
            <Chip
              key={option.days}
              active={range === option.days}
              onClick={() => setRange(option.days)}
              className="h-8 text-xs"
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div
        role="img"
        aria-label={`Bar chart: ${completed} items finished and ${saved} saved over the last ${range} days`}
        className="mt-5 flex h-44 items-end gap-0.5 border-b sm:gap-1"
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={`${formatDayKey(day.date)}: ${day.completed} finished, ${day.saved} saved`}
            className="flex h-full flex-1 items-end justify-center gap-px"
          >
            <div
              className="w-full max-w-4 rounded-t-sm bg-brand-500"
              style={{ height: barHeight(day.completed, max) }}
            />
            <div
              className="w-full max-w-4 rounded-t-sm bg-fg-subtle/30"
              style={{ height: barHeight(day.saved, max) }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-fg-subtle">
        <span>{formatDayKey(days[0].date)}</span>
        <span>Today</span>
      </div>

      <div className="mt-3 flex gap-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand-500" aria-hidden /> Finished
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-fg-subtle/30" aria-hidden /> Saved
        </span>
      </div>
    </Card>
  );
}