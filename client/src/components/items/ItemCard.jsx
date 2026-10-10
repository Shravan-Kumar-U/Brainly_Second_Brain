import {
  Archive,
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  Link2,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Timer,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useItemActions, isEnriching } from '@/hooks/useItems';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { CONTENT_ICONS, OPEN_LABEL } from '@/lib/platforms';
import {
  SNOOZE_OPTIONS,
  formatDayLabel,
  formatDuration,
  formatRelative,
  formatWhen,
  isPastDate,
} from '@/lib/time';
import { hostnameOf } from '@/lib/url';
import { PlatformBadge } from './PlatformBadge';
import { SchedulePicker } from './SchedulePicker';

function IconButton({ label, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-xl border bg-surface text-fg-muted transition',
        'hover:bg-surface-2 hover:text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-60',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SheetAction({ icon: Icon, label, danger = false, loading = false, ...props }) {
  return (
    <li>
      <button
        type="button"
        disabled={loading}
        className={cn(
          'flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition hover:bg-surface-2 disabled:opacity-60',
          danger && 'text-red-600 hover:bg-red-500/10 dark:text-red-400'
        )}
        {...props}
      >
        <Icon className={cn('size-5', loading && 'animate-spin')} aria-hidden />
        {loading ? 'Working…' : label}
      </button>
    </li>
  );
}

// Its own component so the draft time resets every time the sheet opens
function ScheduleSheetBody({ item, onDone, update }) {
  const [draft, setDraft] = useState(item.scheduledAt ? new Date(item.scheduledAt) : null);
  const invalid = draft ? isPastDate(draft) : false;

  const save = () =>
    update.mutate(
      { id: item._id, data: { scheduledAt: draft ? draft.toISOString() : null } },
      { onSuccess: onDone }
    );

  return (
    <>
      <SchedulePicker value={draft} onChange={setDraft} />
      <Button className="mt-5" fullWidth loading={update.isPending} disabled={invalid} onClick={save}>
        {draft ? 'Save reminder' : 'Move to inbox'}
      </Button>
    </>
  );
}

export function ItemCard({ item }) {
  const [sheet, setSheet] = useState(null); // null | 'actions' | 'snooze' | 'schedule' | 'delete'
  const [imageFailed, setImageFailed] = useState(false);
  const actions = useItemActions();
  const now = useNow();

  const close = () => setSheet(null);

  const isActive = item.status === 'inbox' || item.status === 'scheduled';
  const isScheduled = item.status === 'scheduled' && Boolean(item.scheduledAt);
  const overdue = isScheduled && new Date(item.scheduledAt).getTime() <= now;
  const enriching = isEnriching(item);
  const TypeIcon = CONTENT_ICONS[item.contentType] ?? Link2;
  const title = item.title || hostnameOf(item.url);
  const showThumbnail = item.thumbnail && !imageFailed;

  const durationText = item.durationMinutes
    ? `${formatDuration(item.durationMinutes)}${item.contentType === 'article' ? ' read' : ''}`
    : null;

  return (
    <Card className={cn('flex flex-col overflow-hidden transition hover:shadow-md', !isActive && 'opacity-85')}>
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        {showThumbnail ? (
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
        {durationText && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {durationText}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {enriching && !item.title ? (
            <div className="space-y-2" role="status" aria-label="Fetching details">
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{title}</h3>
          )}
          <p className="mt-1 truncate text-xs text-fg-subtle">
            {[item.author, hostnameOf(item.url)].filter(Boolean).join(' · ')}
          </p>
        </div>

        {item.notes && <p className="line-clamp-2 text-xs italic text-fg-muted">“{item.notes}”</p>}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-fg-muted">
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-1 py-0.5 text-xs text-fg-subtle">+{item.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Schedule line: what this item's status means for you right now */}
        {isScheduled && (
          <p
            className={cn(
              'flex flex-wrap items-center gap-1.5 text-xs font-medium',
              overdue ? 'text-amber-700 dark:text-amber-300' : 'text-fg-muted'
            )}
          >
            <CalendarClock className="size-4" aria-hidden />
            {overdue && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-bold uppercase">Due</span>
            )}
            {formatWhen(item.scheduledAt)}
            <span className="font-normal text-fg-subtle">· {formatRelative(item.scheduledAt, now)}</span>
          </p>
        )}
        {item.status === 'inbox' && (
          <button
            type="button"
            onClick={() => setSheet('schedule')}
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <CalendarClock className="size-4" aria-hidden />
            In your inbox · Set a time
          </button>
        )}
        {item.status === 'completed' && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden />
            Done {item.completedAt ? formatDayLabel(item.completedAt).toLowerCase() : ''}
          </p>
        )}
        {item.status === 'archived' && <p className="text-xs font-medium text-fg-subtle">Archived</p>}

        {/* Guilt-free resurfacing: the item was snoozed 3+ times */}
        {isActive && item.needsReview && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Still want this?</p>
            <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/80">
              You've snoozed it {item.snoozeCount} times. Keep it with a new time, or let it go.
            </p>
            <div className="mt-2.5 flex gap-2">
              <Button size="sm" onClick={() => setSheet('schedule')}>
                Keep
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={actions.archive.isPending}
                onClick={() => actions.archive.mutate(item._id)}
              >
                Archive
              </Button>
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 active:scale-[0.98]"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{OPEN_LABEL[item.contentType] ?? 'Open'}</span>
          </a>

          {isActive ? (
            <IconButton
              label="Mark as done"
              disabled={actions.complete.isPending}
              onClick={() => actions.complete.mutate(item._id)}
              className="hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600"
            >
              <Check className="size-5" aria-hidden />
            </IconButton>
          ) : (
            <IconButton
              label="Move back to inbox"
              disabled={actions.restore.isPending}
              onClick={() => actions.restore.mutate(item._id)}
            >
              <RotateCcw className="size-[18px]" aria-hidden />
            </IconButton>
          )}

          <IconButton label="More actions" onClick={() => setSheet('actions')}>
            <MoreHorizontal className="size-5" aria-hidden />
          </IconButton>
        </div>
      </div>

      <Modal open={sheet === 'actions'} onClose={close} title="Manage">
        <p className="mb-3 line-clamp-2 text-sm text-fg-muted">{title}</p>
        <ul className="space-y-1">
          {isActive && <SheetAction icon={Timer} label="Snooze" onClick={() => setSheet('snooze')} />}
          {isActive && (
            <SheetAction
              icon={CalendarClock}
              label={isScheduled ? 'Reschedule' : 'Set a time'}
              onClick={() => setSheet('schedule')}
            />
          )}
          {item.metadataStatus !== 'done' && (
            <SheetAction
              icon={RefreshCw}
              label="Refresh details"
              loading={actions.refresh.isPending}
              onClick={() => actions.refresh.mutate(item._id, { onSuccess: close })}
            />
          )}
          {!isActive && (
            <SheetAction
              icon={RotateCcw}
              label="Move back to inbox"
              onClick={() => actions.restore.mutate(item._id, { onSuccess: close })}
            />
          )}
          {item.status !== 'archived' && (
            <SheetAction
              icon={Archive}
              label="Archive"
              onClick={() => actions.archive.mutate(item._id, { onSuccess: close })}
            />
          )}
          <SheetAction icon={Trash2} label="Delete" danger onClick={() => setSheet('delete')} />
        </ul>
      </Modal>

      <Modal open={sheet === 'snooze'} onClose={close} title="Snooze until…">
        <ul className="space-y-1">
          {SNOOZE_OPTIONS.map((option) => (
            <SheetAction
              key={option.id}
              icon={Timer}
              label={option.label}
              loading={actions.snooze.isPending}
              onClick={() =>
                actions.snooze.mutate({ id: item._id, minutes: option.minutes() }, { onSuccess: close })
              }
            />
          ))}
        </ul>
      </Modal>

      <Modal
        open={sheet === 'schedule'}
        onClose={close}
        title={isScheduled ? 'Reschedule' : 'When will you watch this?'}
        className="sm:max-w-lg"
      >
        <ScheduleSheetBody item={item} onDone={close} update={actions.update} />
      </Modal>

      <Modal open={sheet === 'delete'} onClose={close} title="Delete this item?">
        <p className="text-sm text-fg-muted">
          “{title}” will be removed permanently. This can't be undone. Archive it instead if you might
          want it later.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" fullWidth onClick={close}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={actions.remove.isPending}
            onClick={() => actions.remove.mutate(item._id, { onSuccess: close })}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </Card>
  );
}