import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ItemCard } from './ItemCard';
import { ItemCardSkeleton } from './ItemCardSkeleton';

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

export function ItemGrid({ items, loading, error, onRetry, skeletons = 6, empty }) {
  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{error.message}</Alert>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: skeletons }, (_, index) => (
          <ItemCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (items.length === 0) return empty ?? null;

  return (
    <div className={GRID}>
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}