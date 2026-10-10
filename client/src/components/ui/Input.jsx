import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

import { cn } from '@/lib/cn';

export function Input({ label, error, hint, icon: Icon, type = 'text', id, className, ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-fg-subtle"
          />
        )}

        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            // text-base on phones prevents the browser zooming in on focus
            'h-11 w-full rounded-xl border bg-surface text-base text-fg transition sm:text-sm',
            'placeholder:text-fg-subtle focus:outline-none focus:ring-4',
            Icon ? 'pl-10' : 'pl-3.5',
            isPassword ? 'pr-11' : 'pr-3.5',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
              : 'border-line focus:border-brand-500 focus:ring-brand-500/15'
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-fg-subtle transition hover:text-fg"
          >
            {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-fg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}