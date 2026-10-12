import { Shuffle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useItemPick } from '@/hooks/useItems';
import { cn } from '@/lib/cn';
import { formatDuration, formatRelative } from '@/lib/time';
import { hostnameOf } from '@/lib/url';
import { PlatformBadge } from './PlatformBadge';

const REASONS = {
  overdue: 'This reminder is overdue.',
  'due-soon': 'It is due within the next day.',
  waiting: 'It has been waiting in your inbox the longest.',
  fits: 'A good one to start with.',
};

// Its own component, so the "already shown" list resets every time the dialog opens
function PickBody({ minutes, onClose }) {
  const navigate = useNavigate();
  const [exclude, setExclude] = useState([]);
  const { data: pick, isPending, isFetching } = useItemPick({ minutes, exclude });

  if (isPending) return <Skeleton className="h-40 rounded-2xl" />;

  if (!pick) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm font-medium">
          {exclude.length > 0 ? "That's everything that fits." : 'Nothing fits right now.'}
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          {minutes
            ? 'Try a longer time, or save something new.'
            : 'Save a link and it will show up here.'}
        </p>
        {exclude.length > 0 && (
          <Button className="mt-4" variant="secondary" onClick={() => setExclude([])}>
            Start over
          </Button>
        )}
      </div>
    );
  }

  const { item, reason } = pick;
  const title = item.title || hostnameOf(item.url);
  const meta = [
    item.durationMinutes && formatDuration(item.durationMinutes),
    item.author,
    hostnameOf(item.url),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
      <div className="flex gap-3">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            className="aspect-video w-32 shrink-0 rounded-xl bg-surface-2 object-cover"
          />
        ) : (
          <div className="aspect-video w-32 shrink-0 rounded-xl bg-linear-to-br from-brand-500/15 to-brand-700/10" />
        )}
        <div className="min-w-0">
          <PlatformBadge platform={item.platform} />
          <h3 className="mt-1.5 line-clamp-3 text-[15px] font-semibold leading-snug">{title}</h3>
          <p className="mt-1 truncate text-xs text-fg-subtle">{meta}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm text-fg-muted">
        {REASONS[reason]}
        {reason === 'overdue' && item.scheduledAt && ` Due ${formatRelative(item.scheduledAt)}.`}
      </p>

      <div className="mt-5 flex gap-2">
        <Button
          fullWidth
          onClick={() => {
            onClose();
            navigate(`/focus/${item._id}`);
          }}
        >
          Focus on this
        </Button>
        <Button
          variant="secondary"
          disabled={isFetching}
          onClick={() => setExclude((previous) => [...previous, item._id])}
        >
          <Shuffle className="size-4" aria-hidden />
          Another
        </Button>
      </div>
    </div>
  );
}

export function PickModal({ open, minutes, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={minutes ? `Something for ${minutes} min` : 'Pick one for me'}>
      <PickBody minutes={minutes} onClose={onClose} />
    </Modal>
  );
}