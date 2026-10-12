import { Folder, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { CollectionFormModal } from '@/components/collections/CollectionFormModal';
import { ShareCollectionPanel } from '@/components/collections/ShareCollectionPanel';
import { ItemGrid } from '@/components/items/ItemGrid';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCollectionActions, useCollections } from '@/hooks/useCollections';
import { useInfiniteItems } from '@/hooks/useItems';
import { cn } from '@/lib/cn';
import { COLLECTION_COLORS } from '@/lib/collections';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const collections = useCollections();
  const actions = useCollectionActions();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const collection = collections.data?.find((entry) => entry._id === id);

  const params = useMemo(() => ({ collection: id, sort: '-createdAt', limit: 18 }), [id]);
  const query = useInfiniteItems(params);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  if (collections.isPending) return <Skeleton className="h-40 rounded-2xl" />;

  if (!collection) {
    return (
      <EmptyState
        icon={Folder}
        title="Collection not found"
        description="It may have been deleted."
        action={
          <Link to="/collections">
            <Button>Back to collections</Button>
          </Link>
        }
      />
    );
  }

  const color = COLLECTION_COLORS[collection.color] ?? COLLECTION_COLORS.violet;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', color.soft)}>
            <Folder className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">{collection.name}</h1>
            <p className="mt-1 text-sm text-fg-muted">
              {collection.description || `${collection.itemCount} ${collection.itemCount === 1 ? 'item' : 'items'}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/add?collection=${collection._id}`}>
            <Button>
              <Plus className="size-4" aria-hidden />
              Save a link
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Button>
          <Button variant="ghost" onClick={() => setDeleting(true)} aria-label="Delete collection">
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <ShareCollectionPanel collection={collection} />

      <ItemGrid
        items={items}
        loading={query.isPending}
        error={query.isError ? query.error : null}
        onRetry={query.refetch}
        empty={
          <EmptyState
            icon={Folder}
            title="No links in this collection yet"
            description="Save a link and choose this collection, or move an existing one from its Manage menu."
          />
        }
      />

      {query.hasNextPage && (
        <div className="flex justify-center">
          <Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
            Load more
          </Button>
        </div>
      )}

      <CollectionFormModal open={editing} onClose={() => setEditing(false)} collection={collection} />

      <Modal open={deleting} onClose={() => setDeleting(false)} title="Delete this collection?">
        <p className="text-sm text-fg-muted">
          “{collection.name}” will be removed
          {collection.isShared ? ' and its share link will stop working' : ''}. The links inside stay in
          your library.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setDeleting(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={actions.remove.isPending}
            onClick={() =>
              actions.remove.mutate(collection._id, {
                onSuccess: () => navigate('/collections', { replace: true }),
              })
            }
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}