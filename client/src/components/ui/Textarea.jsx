import { useId } from 'react';

import { cn } from '@/lib/cn';

export function Textarea({ label, hint, id, className, ...props }) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={cn(
          'w-full resize-none rounded-xl border bg-surface px-3.5 py-2.5 text-base text-fg transition sm:text-sm',
          'placeholder:text-fg-subtle focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15'
        )}
        {...props}
      />
      {hint && <p className="mt-1.5 text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}