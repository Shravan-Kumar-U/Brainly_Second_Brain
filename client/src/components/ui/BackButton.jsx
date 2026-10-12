import { ArrowLeft } from 'lucide-react';

import { useGoBack } from '@/hooks/useGoBack';
import { cn } from '@/lib/cn';

export function BackButton({ withLabel = false, className }) {
  const goBack = useGoBack();

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl text-fg-muted transition',
        'hover:bg-surface-2 hover:text-fg active:scale-95',
        withLabel ? 'h-10 px-3 text-sm font-medium' : 'size-10',
        className
      )}
    >
      <ArrowLeft className="size-5" aria-hidden />
      {withLabel && 'Back'}
    </button>
  );
}