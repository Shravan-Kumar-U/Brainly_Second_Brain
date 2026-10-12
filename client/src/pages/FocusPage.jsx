import { CheckCircle2, ExternalLink, Link2, Timer } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { PlatformBadge } from '@/components/items/PlatformBadge';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useItem, useItemActions, useUpdateItem } from '@/hooks/useItems';
import { CONTENT_ICONS, OPEN_LABEL } from '@/lib/platforms';
import { formatDuration, formatWhen } from '@/lib/time';
import { hostnameOf } from '@/lib/url';

// Its own component, so the notes box starts from the loaded item
function FocusBody({ item }) {
  const navigate = useNavigate();
  const actions = useItemActions();
  const saveNotes = useUpdateItem('Notes saved');
  const [notes, setNotes] = useState(item.notes ?? '');
  const [imageFailed, setImageFailed] = useState(false);

  const TypeIcon = CONTENT_ICONS[item.contentType] ?? Link2;
  const isActive = item.status === 'inbox' || item.status === 'scheduled';
  const title = item.title || hostnameOf(item.url);
  const dirty = notes.trim() !== (item.notes ?? '').trim();
  const duration = item.durationMinutes
    ? `${formatDuration(item.durationMinutes)}${item.contentType === 'article' ? ' read' : ''}`
    : null;

  const goHome = () => navigate('/', { replace: true });
  const finish = () => actions.complete.mutate(item._id, { onSuccess: goHome });
  const snooze = () => actions.snooze.mutate({ id: item._id, minutes: 60 }, { onSuccess: goHome });

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-surface-2">
          {item.thumbnail && !imageFailed ? (
            <img
              src={item.thumbnail}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="size-full object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center bg-linear-to-br from-brand-500/15 to-brand-700/10 text-brand-500">
              <TypeIcon className="size-12" aria-hidden />
            </div>
          )}
          <PlatformBadge platform={item.platform} className="absolute left-3 top-3" />
        </div>

        <div className="p-5">
          <h1 className="text-xl font-bold leading-snug tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-fg-subtle">
            {[item.author, hostnameOf(item.url), duration].filter(Boolean).join(' · ')}
          </p>
          {item.status === 'scheduled' && item.scheduledAt && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-muted">
              <Timer className="size-4" aria-hidden />
              Planned for {formatWhen(item.scheduledAt)}
            </p>
          )}
        </div>
      </Card>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-semibold text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-700 active:scale-[0.98]"
      >
        <ExternalLink className="size-5" aria-hidden />
        {OPEN_LABEL[item.contentType] ?? 'Open'} now
      </a>

      <Card className="p-5">
        <Textarea
          label="Your notes"
          rows={5}
          maxLength={2000}
          placeholder="Why did you save this? What are the key takeaways?"
          hint="Saved with the item, so future you remembers what mattered."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        {dirty && (
          <Button
            className="mt-3"
            size="sm"
            loading={saveNotes.isPending}
            onClick={() => saveNotes.mutate({ id: item._id, data: { notes: notes.trim() } })}
          >
            Save notes
          </Button>
        )}
      </Card>

      {isActive ? (
        <div className="flex gap-2">
          <Button fullWidth size="lg" loading={actions.complete.isPending} onClick={finish}>
            <CheckCircle2 className="size-5" aria-hidden />
            Mark as done
          </Button>
          <Button size="lg" variant="secondary" loading={actions.snooze.isPending} onClick={snooze}>
            Snooze 1h
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-fg-muted">
          This item is {item.status}. You can bring it back from your library.
        </p>
      )}
    </div>
  );
}

export default function FocusPage() {
  const { id } = useParams();
  const { data: item, isPending, error } = useItem(id);

  let content;
  if (isPending) {
    content = (
      <div className="space-y-5">
        <Skeleton className="aspect-video rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    );
  } else if (error) {
    content = (
      <EmptyState
        icon={Link2}
        title="Couldn't open this item"
        description={error.status === 404 ? 'It may have been deleted.' : error.message}
        action={
          <Link to="/">
            <Button>Back to home</Button>
          </Link>
        }
      />
    );
  } else {
    content = <FocusBody key={item._id} item={item} />;
  }

  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between px-3 py-3 sm:px-6">
        <BackButton withLabel />
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-xl px-4 pb-16 sm:px-6">{content}</main>
    </div>
  );
}