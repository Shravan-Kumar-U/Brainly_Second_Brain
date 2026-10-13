import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences, useUpdatePreferences } from '@/hooks/usePreferences';

const deviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
};

function Row({ label, children }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="truncate text-right font-medium">{children}</span>
    </li>
  );
}

export function AccountCard() {
  const { user } = useAuth();
  const { data: preferences, isPending, error } = usePreferences();
  const update = useUpdatePreferences();

  if (isPending) return <Skeleton className="h-40 rounded-2xl" />;
  if (error) return <Alert>{error.message}</Alert>;

  const device = deviceTimezone();
  const mismatch = device && device !== preferences.timezone;

  return (
    <Card className="px-5">
      <ul className="divide-y">
        <Row label="Name">{user.name}</Row>
        <Row label="Email">{user.email}</Row>
        <Row label="Timezone">{preferences.timezone}</Row>
      </ul>

      {mismatch && (
        <div className="border-t py-4">
          <p className="text-xs text-fg-muted">
            This device is set to <span className="font-medium">{device}</span>. Reminders, your weekly
            review and watch windows use the timezone above.
          </p>
          <Button
            className="mt-3"
            size="sm"
            variant="secondary"
            loading={update.isPending}
            onClick={() => update.mutate({ timezone: device })}
          >
            Use {device}
          </Button>
        </div>
      )}
    </Card>
  );
}