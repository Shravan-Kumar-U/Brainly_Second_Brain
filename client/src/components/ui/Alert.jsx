import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/cn';

export function Alert({ children, className }) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3',
        'text-sm text-red-700 dark:text-red-300',
        className
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}