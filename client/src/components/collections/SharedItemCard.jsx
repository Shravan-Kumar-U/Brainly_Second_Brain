import { BookmarkPlus, ExternalLink, Link2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { PlatformBadge } from '@/components/items/PlatformBadge';
import { Card } from '@/components/ui/Card';
import { CONTENT_ICONS, OPEN_LABEL } from '@/lib/platforms';
import { formatDuration } from '@/lib/time';
import { hostnameOf } from '@/lib/url';

export function SharedItemCard({ item }) {
  const [imageFailed, setImageFailed] = useState(false);

  const TypeIcon = CONTENT_ICONS[item.contentType] ?? Link2;
  const title = item.title || hostnameOf(item.url);
  const duration = item.durationMinutes
    ? `${formatDuration(item.durationMinutes)}${item.contentType === 'article' ? ' read' : ''}`
    : null;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video bg-surface-2">
        {item.thumbnail && !imageFailed ? (
          <img
            src={item.thumbnail}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-brand-500/15 to-brand-700/10 text-brand-500">
            <TypeIcon className="size-9" aria-hidden />
          </div>
        )}
        <PlatformBadge platform={item.platform} className="absolute left-2.5 top-2.5" />
        {duration && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{title}</h3>
          <p className="mt-1 truncate text-xs text-fg-subtle">
            {[item.author, hostnameOf(item.url)].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="mt-auto flex gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border bg-surface text-sm font-semibold transition hover:bg-surface-2"
          >
            <ExternalLink className="size-4" aria-hidden />
            {OPEN_LABEL[item.contentType] ?? 'Open'}
          </a>
          {/* Logged-out visitors are sent to log in, then land back on this Add page */}
          <Link
            to={`/add?url=${encodeURIComponent(item.url)}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 active:scale-[0.98]"
          >
            <BookmarkPlus className="size-4" aria-hidden />
            Save
          </Link>
        </div>
      </div>
    </Card>
  );
}