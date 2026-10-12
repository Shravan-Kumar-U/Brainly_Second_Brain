import { useQuery } from '@tanstack/react-query';
import { Link2 } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { sharedApi } from '@/api/shared.api';
import { SharedItemCard } from '@/components/collections/SharedItemCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Logo } from '@/components/ui/Logo';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

export default function SharedCollectionPage() {
  const { token } = useParams();
  const { data, isPending, error } = useQuery({
    queryKey: ['shared', token],
    queryFn: () => sharedApi.get(token),
    retry: false,
    refetchOnWindowFocus: false,
  });

  let content;
  if (isPending) {
    content = (
      <div className={GRID}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <EmptyState
        icon={Link2}
        title="This link isn't available"
        description={
          error.status === 404
            ? 'The owner may have stopped sharing this collection.'
            : error.message
        }
        action={
          <Link to="/">
            <Button>Open Brainly</Button>
          </Link>
        }
      />
    );
  } else {
    const { collection, items } = data;
    content = (
      <>
        <div className="mb-6">
          <p className="text-sm text-fg-muted">{collection.ownerName} shared a collection</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{collection.name}</h1>
          {collection.description && (
            <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">{collection.description}</p>
          )}
          <p className="mt-1.5 text-xs text-fg-subtle">
            {collection.itemCount} {collection.itemCount === 1 ? 'link' : 'links'}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState icon={Link2} title="Nothing in here yet" description="Check back later." />
        ) : (
          <div className={GRID}>
            {items.map((item) => (
              <SharedItemCard key={item._id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-dashed p-6 text-center">
          <p className="text-sm font-semibold">Save links now, remember them later.</p>
          <p className="mt-1 text-sm text-fg-muted">
            Brainly reminds you at the time you choose, so good finds never get lost.
          </p>
          <Link to="/register" className="mt-4 inline-block">
            <Button>Get Brainly</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link to="/">
              <Button size="sm" variant="secondary">
                Open Brainly
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 lg:px-10">{content}</main>
    </div>
  );
}