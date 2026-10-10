import { Link2 } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CONTENT_ICONS } from '@/lib/platforms';
import { hostnameOf } from '@/lib/url';
import { formatDuration } from '@/lib/time';
import { PlatformBadge } from './PlatformBadge';

export function LinkPreviewCard({ state, data, error, url }) {
  const [failedImage, setFailedImage] = useState(null);

  if (state === 'idle') {
    return (
      <Card className="grid place-items-center border-dashed px-6 py-12 text-center shadow-none">
        <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-fg-muted">
          <Link2 className="size-6" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium">Your preview shows up here</p>
        <p className="mt-1 text-xs text-fg-subtle">Paste a link from YouTube, Instagram, GitHub, X…</p>
      </Card>
    );
  }

  if (state === 'loading') {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="aspect-video rounded-none" />
        <div className="space-y-2 p-4">
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </Card>
    );
  }

  const platform = data?.platform ?? 'other';
  const contentType = data?.contentType ?? 'other';
  const TypeIcon = CONTENT_ICONS[contentType] ?? Link2;
  const meta = data?.metadata;
  const thumbnail = meta?.thumbnail && failedImage !== meta.thumbnail ? meta.thumbnail : null;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-surface-2">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setFailedImage(thumbnail)}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-brand-500/15 to-brand-700/10 text-brand-500">
            <TypeIcon className="size-10" aria-hidden />
          </div>
        )}
        <PlatformBadge platform={platform} className="absolute left-3 top-3" />
        {meta?.durationMinutes && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(meta.durationMinutes)}
            {contentType === 'article' ? ' read' : ''}
          </span>
        )}
      </div>

      <div className="p-4">
        {state === 'error' ? (
          <>
            <p className="text-sm font-semibold">{hostnameOf(url)}</p>
            <p className="mt-1 text-xs text-fg-muted">
              {error?.message ?? "Couldn't load a preview"}. You can still save this link.
            </p>
          </>
        ) : (
          <>
            <p className="line-clamp-2 text-[15px] font-semibold leading-snug">
              {meta?.title || hostnameOf(url)}
            </p>
            <p className="mt-1 truncate text-xs text-fg-subtle">
              {[meta?.author, hostnameOf(url)].filter(Boolean).join(' · ')}
            </p>
            {meta?.description && (
              <p className="mt-2 line-clamp-3 text-xs text-fg-muted">{meta.description}</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}