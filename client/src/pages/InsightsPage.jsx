import { ChartColumn, Clock, Flame, ListChecks, Sparkles, Target, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';

import { ActivityChart } from '@/components/insights/ActivityChart';
import { Heatmap } from '@/components/insights/Heatmap';
import { PlatformBars } from '@/components/insights/PlatformBars';
import { StatCard } from '@/components/insights/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useInsights } from '@/hooks/useInsights';
import { sumBy } from '@/lib/insights';
import { formatDuration } from '@/lib/time';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const weekComparison = (thisWeek, lastWeek) => {
  const diff = thisWeek - lastWeek;
  if (diff === 0) return 'Same as last week';
  return `${diff > 0 ? '+' : ''}${diff} vs last week`;
};

function Nudge({ summary, streak }) {
  if (summary.overdue > 0) {
    return (
      <Link to="/library?status=scheduled" className="block">
        <Card className="flex items-center gap-3 border-amber-500/30 bg-amber-500/10 p-4 transition hover:bg-amber-500/15">
          <TriangleAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden />
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            {plural(summary.overdue, 'reminder')} past due. Pick one and finish it today.
          </p>
        </Card>
      </Link>
    );
  }

  let message = "You're all caught up. Nice work.";
  if (summary.active > 0 && streak.current === 0) {
    message = 'Finish one item today to start a streak.';
  } else if (summary.active > 0) {
    message = `Keep your ${plural(streak.current, 'day')} streak going. One item is enough.`;
  }

  return (
    <Card className="flex items-center gap-3 p-4">
      <Sparkles className="size-5 shrink-0 text-brand-500" aria-hidden />
      <p className="text-sm font-medium">{message}</p>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-52 rounded-2xl" />
    </div>
  );
}

export default function InsightsPage() {
  const { data, isPending, error, refetch } = useInsights();

  let content;

  if (isPending) {
    content = <LoadingState />;
  } else if (error) {
    content = (
      <div className="space-y-3">
        <Alert>{error.message}</Alert>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  } else if (data.summary.total === 0) {
    content = (
      <EmptyState
        icon={ChartColumn}
        title="Nothing to chart yet"
        description="Save a few links and finish them. Your streak and activity will appear here."
      />
    );
  } else {
    const { summary, streak, daily, platforms } = data;
    const thisWeek = sumBy(daily.slice(-7), 'completed');
    const lastWeek = sumBy(daily.slice(-14, -7), 'completed');
    const minutes = sumBy(daily.slice(-30), 'minutes');

    content = (
      <div className="space-y-6">
        <Nudge summary={summary} streak={streak} />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Flame}
            tone="amber"
            label="Streak"
            value={plural(streak.current, 'day')}
            detail={`Longest: ${plural(streak.longest, 'day')}`}
          />
          <StatCard
            icon={ListChecks}
            tone="emerald"
            label="Finished this week"
            value={thisWeek}
            detail={weekComparison(thisWeek, lastWeek)}
          />
          <StatCard
            icon={Clock}
            tone="sky"
            label="Time well spent"
            value={minutes ? formatDuration(minutes) : '0 min'}
            detail="Finished in the last 30 days"
          />
          <StatCard
            icon={Target}
            label="Finish rate"
            value={`${summary.finishRate}%`}
            detail={`${summary.completed} finished, ${summary.active} waiting`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ActivityChart daily={daily} />
          </div>
          <PlatformBars platforms={platforms} />
        </div>

        <Heatmap daily={daily} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Insights" subtitle="See how your second brain is working for you." />
      {content}
    </div>
  );
}