import { Plus, Search, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { ItemGrid } from '@/components/items/ItemGrid';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteItems, useTags } from '@/hooks/useItems';
import { cn } from '@/lib/cn';
import { PLATFORM_OPTIONS } from '@/lib/platforms';
import { FIT_OPTIONS } from '@/lib/time';

const STATUS_TABS = [
  { id: 'active', label: 'Active' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'completed', label: 'Done' },
  { id: 'archived', label: 'Archived' },
];

const STATUS_IDS = STATUS_TABS.map((tab) => tab.id);
const PLATFORM_IDS = PLATFORM_OPTIONS.map((option) => option.value);
const FIT_VALUES = FIT_OPTIONS.map(String);

// Reads the starting filters from the URL once (Home's "15 min" chips link here)
const readInitialFilters = (params) => {
  const pick = (key, allowed, fallback) => (allowed.includes(params.get(key)) ? params.get(key) : fallback);

  return {
    status: pick('status', STATUS_IDS, 'active'),
    platform: pick('platform', PLATFORM_IDS, ''),
    fit: pick('fit', FIT_VALUES, ''),
    tag: params.get('tag') ?? '',
  };
};

export default function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => readInitialFilters(searchParams));
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const q = useDebounce(search, 350).trim();

  const setFilter = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }));
  const toggleFilter = (key, value) =>
    setFilters((previous) => ({ ...previous, [key]: previous[key] === value ? '' : value }));

  const params = useMemo(
    () => ({
      status: filters.status,
      sort: filters.status === 'scheduled' ? 'scheduledAt' : '-createdAt',
      limit: 18,
      ...(filters.platform && { platform: filters.platform }),
      ...(filters.tag && { tag: filters.tag }),
      ...(filters.fit && { maxDuration: Number(filters.fit) }),
      ...(q && { q }),
    }),
    [filters, q]
  );

  const query = useInfiniteItems(params);
  const tags = useTags();

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.meta.total;
  const hasFilters = Boolean(filters.platform || filters.tag || filters.fit || q);

  const clearFilters = () => {
    setSearch('');
    setFilters((previous) => ({ status: previous.status, platform: '', fit: '', tag: '' }));
  };

  const empty = hasFilters ? (
    <EmptyState
      icon={SearchX}
      title="No matches"
      description="Nothing fits those filters. Items without a known length are hidden by the length filter."
      action={
        <Button variant="secondary" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Plus}
      title="Nothing here yet"
      description="Save a link and it will show up in this list."
      action={<Button onClick={() => navigate('/add')}>Save a link</Button>}
    />
  );

  return (
    <div>
      <PageHeader
        title="Library"
        subtitle={total !== undefined ? `${total} ${total === 1 ? 'item' : 'items'}` : ' '}
        action={<Button onClick={() => navigate('/add')}>Save a link</Button>}
      />

      <div className="space-y-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {STATUS_TABS.map((tab) => (
            <Chip key={tab.id} active={filters.status === tab.id} onClick={() => setFilter('status', tab.id)}>
              {tab.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            icon={Search}
            type="search"
            aria-label="Search your library"
            placeholder="Search titles, notes, tags…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1"
          />
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Select
              label="Platform"
              value={filters.platform}
              onChange={(event) => setFilter('platform', event.target.value)}
              className="sm:w-44"
            >
              <option value="">All platforms</option>
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="Length"
              value={filters.fit}
              onChange={(event) => setFilter('fit', event.target.value)}
              className="sm:w-44"
            >
              <option value="">Any length</option>
              {FIT_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes < 60 ? `Under ${minutes} min` : 'Under 1 hour'}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {tags.data?.length > 0 && (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {tags.data.slice(0, 15).map(({ tag, count }) => (
              <Chip
                key={tag}
                active={filters.tag === tag}
                onClick={() => toggleFilter('tag', tag)}
                className="h-8 text-xs"
              >
                #{tag} <span className="opacity-60">{count}</span>
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className={cn('mt-6 transition-opacity', query.isPlaceholderData && 'opacity-60')}>
        <ItemGrid
          items={items}
          loading={query.isPending}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          empty={empty}
        />
      </div>

      {query.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}