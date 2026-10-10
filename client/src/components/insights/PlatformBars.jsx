import { PlatformBadge } from '@/components/items/PlatformBadge';
import { Card } from '@/components/ui/Card';

export function PlatformBars({ platforms }) {
  if (platforms.length === 0) return null;
  const maxSaved = Math.max(...platforms.map((entry) => entry.saved));

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Where you save from</h2>
      <p className="mt-0.5 text-xs text-fg-muted">The filled part is what you finished.</p>

      <ul className="mt-4 space-y-3.5">
        {platforms.map(({ platform, saved, completed }) => (
          <li key={platform}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <PlatformBadge platform={platform} />
              <span className="text-xs text-fg-muted">
                {completed} of {saved} finished
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-fg-subtle/30"
                style={{ width: `${(saved / maxSaved) * 100}%` }}
              >
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${(completed / saved) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}