import { Brain } from 'lucide-react';

import { cn } from '@/lib/cn';

export function Logo({ size = 'md', showText = true, className }) {
  const large = size === 'lg';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid place-items-center bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30',
          large ? 'size-14 rounded-2xl' : 'size-9 rounded-xl'
        )}
      >
        <Brain className={large ? 'size-8' : 'size-5'} aria-hidden />
      </span>
      {showText && (
        <span className={cn('font-bold tracking-tight', large ? 'text-2xl' : 'text-lg')}>
          Brainly
        </span>
      )}
    </div>
  );
}