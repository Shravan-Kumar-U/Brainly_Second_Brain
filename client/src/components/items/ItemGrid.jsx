import { Check } from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { ItemCard } from './ItemCard';
import { ItemCardSkeleton } from './ItemCardSkeleton';

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

// In selection mode a transparent layer covers the card, so a tap selects it
// instead of opening a link or a menu underneath.
function SelectableItem({ item, selected, onToggle }) {
  return (
    <div className="relative">
      <ItemCard item={item} />
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${selected ? 'Deselect' : 'Select'} ${item.title || item.url}`}
        onClick={() => onToggle(item._id)}
        className={cn(
          'absolute inset-0 z-10 rounded-2xl border-2 transition',
          selected ? 'border-brand-500 bg-brand-500/10' : 'border-transparent hover:bg-brand-500/5'
        )}
      >
        <span
          className={cn(
            'absolute right-3 top-3 grid size-7 place-items-center rounded-full border-2 transition',
            selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-surface'
          )}
        >
          {selected && <Check className="size-4" aria-hidden />}
        </span>
      </button>
    </div>
  );
}

export function ItemGrid({ items, loading, error, onRetry, skeletons = 6, empty, selection }) {
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
      {items.map((item) =>
        selection ? (
          <SelectableItem
            key={item._id}
            item={item}
            selected={selection.selected.has(item._id)}
            onToggle={selection.onToggle}
          />
        ) : (
          <ItemCard key={item._id} item={item} />
        )
      )}
    </div>
  );
}