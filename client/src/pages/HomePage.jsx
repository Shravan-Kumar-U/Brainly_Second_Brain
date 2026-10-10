import { ArrowRight, CalendarClock, Inbox, Link2, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { ItemGrid } from '@/components/items/ItemGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useItemList } from '@/hooks/useItems';
import { FIT_OPTIONS } from '@/lib/time';

// Defined outside the component so the query keys stay identical between renders
const UP_NEXT = { status: 'scheduled', sort: 'scheduledAt', limit: 6 };
const INBOX = { status: 'inbox', sort: '-createdAt', limit: 6 };

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

function QuickAdd() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const link = value.trim();
    navigate(link ? `/add?url=${encodeURIComponent(link)}` : '/add');
  };

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Save something for later</h2>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <Input
          icon={Link2}
          inputMode="url"
          aria-label="Link to save"
          placeholder="Paste a link…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-w-0 flex-1"
        />
        <Button type="submit">Save</Button>
      </form>
    </Card>
  );
}

function TimeFit() {
  const navigate = useNavigate();

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Zap className="size-4 text-brand-500" aria-hidden />I have time right now
      </h2>
      <p className="mt-1 text-xs text-fg-muted">See only what fits. Items with a known length are matched.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FIT_OPTIONS.map((minutes) => (
          <Chip key={minutes} onClick={() => navigate(`/library?fit=${minutes}`)}>
            {minutes < 60 ? `${minutes} min` : '1 hour'}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

function Section({ title, total, to, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {title}
          {total > 0 && (
            <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-fg-muted">
              {total}
            </span>
          )}
        </h2>
        {to && total > 0 && (
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            View all <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const upNext = useItemList(UP_NEXT);
  const inbox = useItemList(INBOX);

  const addAction = <Button onClick={() => navigate('/add')}>Save a link</Button>;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-fg-muted">{greeting()},</p>
        <h1 className="text-2xl font-bold tracking-tight">{user.name.split(' ')[0]}</h1>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <QuickAdd />
        </div>
        <div className="lg:col-span-2">
          <TimeFit />
        </div>
      </div>

      <Section title="Up next" total={upNext.data?.meta.total} to="/library?status=scheduled">
        <ItemGrid
          items={upNext.data?.items ?? []}
          loading={upNext.isPending}
          error={upNext.error}
          onRetry={upNext.refetch}
          skeletons={3}
          empty={
            <EmptyState
              icon={CalendarClock}
              title="Nothing scheduled"
              description="Save a link and pick a time. Brainly keeps it here until it's due."
              action={addAction}
            />
          }
        />
      </Section>

      <Section title="Inbox" total={inbox.data?.meta.total} to="/library?status=inbox">
        <ItemGrid
          items={inbox.data?.items ?? []}
          loading={inbox.isPending}
          error={inbox.error}
          onRetry={inbox.refetch}
          skeletons={3}
          empty={
            <EmptyState
              icon={Inbox}
              title="Inbox is clear"
              description="Links you save without a time land here, so you can schedule them later."
            />
          }
        />
      </Section>
    </div>
  );
}