import { cn } from '@/lib/cn';

export function Chip({ active = false, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}