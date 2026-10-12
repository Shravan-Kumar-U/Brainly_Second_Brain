import { Folder, Share2 } from 'lucide-react';
import { Link } from 'react-router';

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { COLLECTION_COLORS } from '@/lib/collections';

export function CollectionCard({ collection }) {
  const color = COLLECTION_COLORS[collection.color] ?? COLLECTION_COLORS.violet;
  const percent = collection.itemCount
    ? Math.round((collection.doneCount / collection.itemCount) * 100)
    : 0;

  return (
    <Link to={`/collections/${collection._id}`} className="block">
      <Card className="h-full p-5 transition hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <span className={cn('grid size-11 place-items-center rounded-xl', color.soft)}>
            <Folder className="size-5" aria-hidden />
          </span>
          {collection.isShared && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-xs font-medium text-fg-muted">
              <Share2 className="size-3.5" aria-hidden />
              Shared
            </span>
          )}
        </div>

        <h3 className="mt-4 truncate text-base font-semibold">{collection.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs text-fg-muted">
          {collection.description || 'No description'}
        </p>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className={cn('h-full rounded-full', color.bar)} style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-fg-subtle">
          {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'} · {collection.doneCount} done
        </p>
      </Card>
    </Link>
  );
}