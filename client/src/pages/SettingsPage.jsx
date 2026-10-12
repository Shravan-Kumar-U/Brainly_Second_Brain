import { PageHeader } from '@/components/layout/PageHeader';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

function Row({ label, value }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </li>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Reminders and your account." />

      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-fg-muted">Notifications</h2>
          <NotificationSettings />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-fg-muted">Account</h2>
          <Card className="px-5">
            <ul className="divide-y">
              <Row label="Name" value={user.name} />
              <Row label="Email" value={user.email} />
              <Row label="Timezone" value={user.timezone} />
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}