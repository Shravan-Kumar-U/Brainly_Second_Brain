import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';

import { preferencesApi } from '@/api/preferences.api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { usePreferences, useUpdatePreferences } from '@/hooks/usePreferences';
import { useToast } from '@/hooks/useToast';

export function WeeklyReviewCard() {
  const { data: preferences, isPending, error } = usePreferences();
  const update = useUpdatePreferences();
  const toast = useToast();
  const [sending, setSending] = useState(false);

  if (isPending) return <Skeleton className="h-28 rounded-2xl" />;
  if (error) return <Alert>{error.message}</Alert>;

  const sendPreview = async () => {
    setSending(true);
    try {
      await preferencesApi.previewWeeklyReview();
      toast.info('Preview sent. Switch away from Brainly now. It arrives in about 5 seconds.');
    } catch (previewError) {
      toast.error(previewError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
          <CalendarCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Weekly review</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Every Sunday at 6 PM, a short summary of what you finished and what is waiting.
          </p>
        </div>
        <Switch
          label="Weekly review"
          checked={preferences.weeklyReview}
          disabled={update.isPending}
          onChange={(weeklyReview) => update.mutate({ weeklyReview })}
        />
      </div>

      {preferences.weeklyReview && (
        <Button className="mt-4" variant="secondary" size="sm" loading={sending} onClick={sendPreview}>
          Send me a preview
        </Button>
      )}
    </Card>
  );
}