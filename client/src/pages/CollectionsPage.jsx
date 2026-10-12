import { Layers, Plus } from 'lucide-react';
import { useState } from 'react';

import { CollectionCard } from '@/components/collections/CollectionCard';
import { CollectionFormModal } from '@/components/collections/CollectionFormModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCollections } from '@/hooks/useCollections';

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

export default function CollectionsPage() {
  const { data: collections, isPending, error, refetch } = useCollections();
  const [creating, setCreating] = useState(false);

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" aria-hidden />
      New collection
    </Button>
  );

  let content;
  if (isPending) {
    content = (
      <div className={GRID}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <div className="space-y-3">
        <Alert>{error.message}</Alert>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  } else if (collections.length === 0) {
    content = (
      <EmptyState
        icon={Layers}
        title="No collections yet"
        description="Group related links like “AI Learning” or “Gym”, then share the whole set with a friend."
        action={newButton}
      />
    );
  } else {
    content = (
      <div className={GRID}>
        {collections.map((collection) => (
          <CollectionCard key={collection._id} collection={collection} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Collections"
        subtitle="Group links by topic, and share a whole set in one tap."
        action={collections?.length > 0 ? newButton : null}
      />
      {content}
      <CollectionFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}