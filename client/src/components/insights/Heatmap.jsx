import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatDayKey, mondayIndex } from '@/lib/insights';

// Full class names so Tailwind can detect them
const LEVELS = [
  'bg-surface-2',
  'bg-brand-500/30',
  'bg-brand-500/55',
  'bg-brand-500/80',
  'bg-brand-600',
];

const levelFor = (count) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
};

export function Heatmap({ daily }) {
  // Empty cells at the start so the first day lands on its correct weekday row
  const blanks = mondayIndex(daily[0].date);
  const weeks = Math.ceil((blanks + daily.length) / 7);
  const total = daily.reduce((sum, day) => sum + day.completed, 0);
  const activeDays = daily.filter((day) => day.completed > 0).length;

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Your consistency</h2>
      <p className="mt-0.5 text-xs text-fg-muted">
        {total} finished across {activeDays} active days in the last 13 weeks
      </p>

      <div
        role="img"
        aria-label={`Activity heatmap: finished something on ${activeDays} of the last ${daily.length} days`}
        className="mt-4 grid max-w-3xl grid-rows-7 gap-1"
        style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, gridAutoFlow: 'column' }}
      >
        {Array.from({ length: blanks }, (_, index) => (
          <div key={`blank-${index}`} aria-hidden />
        ))}
        {daily.map((day) => (
          <div
            key={day.date}
            title={`${formatDayKey(day.date)}: ${day.completed} finished`}
            className={cn('aspect-square rounded-[3px]', LEVELS[levelFor(day.completed)])}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-fg-subtle">
        Less
        {LEVELS.map((level) => (
          <span key={level} className={cn('size-3 rounded-[3px]', level)} aria-hidden />
        ))}
        More
      </div>
    </Card>
  );
}