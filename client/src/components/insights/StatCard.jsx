import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

// Full class names so Tailwind can detect them
const TONES = {
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
};

export function StatCard({ icon: Icon, label, value, detail, tone = 'brand' }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-fg-muted">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      {detail && <p className="mt-1 text-xs text-fg-subtle">{detail}</p>}
    </Card>
  );
}