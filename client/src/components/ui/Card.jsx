import { cn } from '@/lib/cn';

export function Card({ className, ...props }) {
  return <div className={cn('rounded-2xl border bg-surface shadow-sm', className)} {...props} />;
}