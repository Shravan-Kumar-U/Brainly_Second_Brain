import { PageHeader } from '@/components/layout/PageHeader';
import { AccountCard } from '@/components/settings/AccountCard';
import { ExportCard } from '@/components/settings/ExportCard';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { WeeklyReviewCard } from '@/components/settings/WeeklyReviewCard';
import { WindowsSettings } from '@/components/windows/WindowsSettings';

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-fg-muted">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Reminders, your routine and your data." />

      <div className="grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <Section title="Notifications">
            <NotificationSettings />
            <WeeklyReviewCard />
          </Section>
          <Section title="Your data">
            <ExportCard />
          </Section>
        </div>

        <div className="space-y-8">
          <Section title="Watch windows">
            <WindowsSettings />
          </Section>
          <Section title="Account">
            <AccountCard />
          </Section>
        </div>
      </div>
    </div>
  );
}