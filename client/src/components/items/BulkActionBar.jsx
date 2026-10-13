import { Archive, CalendarClock, Check, FolderOpen, RotateCcw, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCollections } from '@/hooks/useCollections';
import { useBulkAction } from '@/hooks/useBulk';
import { useTags } from '@/hooks/useItems';
import { cn } from '@/lib/cn';
import { COLLECTION_COLORS } from '@/lib/collections';
import { isPastDate } from '@/lib/time';
import { SchedulePicker } from './SchedulePicker';
import { TagInput } from './TagInput';

const plural = (count) => `${count} item${count === 1 ? '' : 's'}`;

function ActionButton({ icon: Icon, label, danger = false, ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition',
        'active:scale-95 disabled:pointer-events-none disabled:opacity-50',
        danger
          ? 'text-red-600 hover:bg-red-500/10 dark:text-red-400'
          : 'bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg'
      )}
      {...props}
    >
      <Icon className="size-[18px]" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// Each dialog body is its own component, so its draft resets every time the dialog opens
function ScheduleBody({ count, loading, onSubmit }) {
  const [draft, setDraft] = useState(null);
  const invalid = draft ? isPastDate(draft) : false;

  return (
    <>
      <SchedulePicker value={draft} onChange={setDraft} />
      <Button
        className="mt-5"
        fullWidth
        loading={loading}
        disabled={invalid}
        onClick={() => onSubmit(draft ? draft.toISOString() : null)}
      >
        {draft ? `Schedule ${plural(count)}` : `Move ${plural(count)} to inbox`}
      </Button>
    </>
  );
}

function TagBody({ count, loading, onSubmit }) {
  const [tags, setTags] = useState([]);
  const saved = useTags();

  return (
    <>
      <TagInput value={tags} onChange={setTags} suggestions={saved.data?.map((entry) => entry.tag) ?? []} />
      <p className="mt-3 text-xs text-fg-muted">
        Added to {plural(count)}. Existing tags stay, up to 10 per item.
      </p>
      <Button className="mt-4" fullWidth loading={loading} disabled={tags.length === 0} onClick={() => onSubmit(tags)}>
        Add tags
      </Button>
    </>
  );
}

function MoveBody({ loading, onSubmit }) {
  const { data: collections, isPending } = useCollections();
  if (isPending) return <Skeleton className="h-24 rounded-xl" />;

  const row =
    'flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition hover:bg-surface-2 disabled:opacity-60';

  return (
    <ul className="space-y-1">
      <li>
        <button type="button" disabled={loading} onClick={() => onSubmit(null)} className={row}>
          <FolderOpen className="size-5 text-fg-subtle" aria-hidden />
          No collection
        </button>
      </li>
      {collections.map((collection) => (
        <li key={collection._id}>
          <button type="button" disabled={loading} onClick={() => onSubmit(collection._id)} className={row}>
            <span
              className={cn('size-3 shrink-0 rounded-full', (COLLECTION_COLORS[collection.color] ?? COLLECTION_COLORS.violet).dot)}
              aria-hidden
            />
            <span className="truncate">{collection.name}</span>
          </button>
        </li>
      ))}
      {collections.length === 0 && (
        <li className="px-3 py-2 text-sm text-fg-muted">You haven't created any collections yet.</li>
      )}
    </ul>
  );
}

export function BulkActionBar({ ids, mode, allSelected, onToggleAll, onExit }) {
  const bulk = useBulkAction();
  const [dialog, setDialog] = useState(null); // 'schedule' | 'tag' | 'move' | 'delete'

  const count = ids.length;
  const none = count === 0;
  const close = () => setDialog(null);

  // After any success, leave selection mode so the list returns to normal
  const run = (payload) =>
    bulk.mutate(
      { ids, ...payload },
      {
        onSuccess: () => {
          close();
          onExit();
        },
      }
    );

  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t bg-surface/95 backdrop-blur-lg lg:bottom-0 lg:left-64">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
          <div className="shrink-0">
            <p className="text-sm font-semibold">{none ? 'Select items' : `${count} selected`}</p>
            <button
              type="button"
              onClick={onToggleAll}
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              {allSelected ? 'Clear' : 'Select all'}
            </button>
          </div>

          <div className="no-scrollbar ml-auto flex gap-1.5 overflow-x-auto">
            {mode === 'active' ? (
              <>
                <ActionButton icon={Check} label="Done" disabled={none || bulk.isPending} onClick={() => run({ action: 'complete' })} />
                <ActionButton icon={CalendarClock} label="Schedule" disabled={none} onClick={() => setDialog('schedule')} />
                <ActionButton icon={Tag} label="Tag" disabled={none} onClick={() => setDialog('tag')} />
                <ActionButton icon={FolderOpen} label="Move" disabled={none} onClick={() => setDialog('move')} />
                <ActionButton icon={Archive} label="Archive" disabled={none || bulk.isPending} onClick={() => run({ action: 'archive' })} />
              </>
            ) : (
              <>
                <ActionButton icon={RotateCcw} label="Restore" disabled={none || bulk.isPending} onClick={() => run({ action: 'restore' })} />
                <ActionButton icon={Tag} label="Tag" disabled={none} onClick={() => setDialog('tag')} />
                <ActionButton icon={FolderOpen} label="Move" disabled={none} onClick={() => setDialog('move')} />
              </>
            )}
            <ActionButton icon={Trash2} label="Delete" danger disabled={none} onClick={() => setDialog('delete')} />
          </div>

          <Button variant="ghost" size="sm" onClick={onExit}>
            Cancel
          </Button>
        </div>
      </div>

      <Modal open={dialog === 'schedule'} onClose={close} title={`Schedule ${plural(count)}`} className="sm:max-w-lg">
        <ScheduleBody count={count} loading={bulk.isPending} onSubmit={(scheduledAt) => run({ action: 'schedule', scheduledAt })} />
      </Modal>

      <Modal open={dialog === 'tag'} onClose={close} title={`Tag ${plural(count)}`}>
        <TagBody count={count} loading={bulk.isPending} onSubmit={(tags) => run({ action: 'tag', tags })} />
      </Modal>

      <Modal open={dialog === 'move'} onClose={close} title={`Move ${plural(count)}`}>
        <MoveBody loading={bulk.isPending} onSubmit={(collection) => run({ action: 'move', collection })} />
      </Modal>

      <Modal open={dialog === 'delete'} onClose={close} title={`Delete ${plural(count)}?`}>
        <p className="text-sm text-fg-muted">
          They will be removed permanently. This can't be undone. Archive them instead if you might want
          them later.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" fullWidth onClick={close}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth loading={bulk.isPending} onClick={() => run({ action: 'delete' })}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}