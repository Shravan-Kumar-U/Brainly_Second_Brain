import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

export function Select({ label, className, children, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={label}
        className="h-11 w-full appearance-none rounded-xl border bg-surface pl-3.5 pr-9 text-base text-fg transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 sm:text-sm"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
      />
    </div>
  );
}