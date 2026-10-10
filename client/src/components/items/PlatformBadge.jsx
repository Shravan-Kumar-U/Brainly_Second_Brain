import { PLATFORM_META } from '@/lib/platforms';
import { cn } from '@/lib/cn';

export function PlatformBadge({ platform, className }) {
  const meta = PLATFORM_META[platform] ?? PLATFORM_META.other;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold shadow-sm',
        meta.badge,
        className
      )}
    >
      {meta.label}
    </span>
  );
}