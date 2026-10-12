import { Check, Folder } from 'lucide-react';
import { Link } from 'react-router';

import { Skeleton } from '@/components/ui/Skeleton';
import { useCollections } from '@/hooks/useCollections';
import { useUpdateItem } from '@/hooks/useItems';
import { cn } from '@/lib/cn';
import { COLLECTION_COLORS } from '@/lib/collections';

export function CollectionPicker({ item, onDone }) {
  const { data: collections, isPending } = useCollections();
  const update = useUpdateItem('Moved');

  const move = (collectionId) => {
    if (collectionId === item.collection) return onDone();
    return update.mutate({ id: item._id, data: { collection: collectionId } }, { onSuccess: onDone });
  };

  if (isPending) return <Skeleton className="h-32 rounded-xl" />;

  const rowClass =
    'flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition hover:bg-surface-2 disabled:opacity-60';

  return (
    <div>
      <ul className="space-y-1">
        <li>
          <button type="button" disabled={update.isPending} onClick={() => move(null)} className={rowClass}>
            <Folder className="size-5 text-fg-subtle" aria-hidden />
            <span className="flex-1">No collection</span>
            {!item.collection && <Check className="size-4 text-brand-500" aria-hidden />}
          </button>
        </li>
        {collections.map((collection) => (
          <li key={collection._id}>
            <button
              type="button"
              disabled={update.isPending}
              onClick={() => move(collection._id)}
              className={rowClass}
            >
              <span
                className={cn(
                  'size-3 shrink-0 rounded-full',
                  (COLLECTION_COLORS[collection.color] ?? COLLECTION_COLORS.violet).dot
                )}
                aria-hidden
              />
              <span className="flex-1 truncate">{collection.name}</span>
              {item.collection === collection._id && <Check className="size-4 text-brand-500" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>

      {collections.length === 0 && (
        <p className="px-3 py-2 text-sm text-fg-muted">You haven't created any collections yet.</p>
      )}

      <Link to="/collections" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        Manage collections
      </Link>
    </div>
  );
}