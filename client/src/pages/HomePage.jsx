import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { healthApi } from '@/api/health.api';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const UPCOMING = [
  'Phase 6: save links, set reminder times, browse your library',
  'Phase 7: install Brainly on your phone, share straight from YouTube',
  'Phase 8: reminders that arrive as real notifications',
];

function StatusRow({ label, state, detail }) {
  return (
    <li className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="flex items-center gap-1.5 font-medium">
        {state === 'checking' && <Loader2 className="size-4 animate-spin text-fg-subtle" />}
        {state === 'ok' && <CheckCircle2 className="size-4 text-emerald-500" />}
        {state === 'down' && <XCircle className="size-4 text-red-500" />}
        {detail}
      </span>
    </li>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [health, setHealth] = useState({ state: 'checking' });

  useEffect(() => {
    let active = true;

    healthApi
      .check()
      .then((data) => active && setHealth({ state: 'ok', database: data.database }))
      .catch((error) => active && setHealth({ state: 'down', message: error.message }));

    return () => {
      active = false;
    };
  }, []);

  const apiDetail =
    health.state === 'checking' ? 'Checking…' : health.state === 'ok' ? 'Connected' : 'Unreachable';

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-fg-muted">{greeting()},</p>
        <h1 className="text-2xl font-bold tracking-tight">{user.name.split(' ')[0]}</h1>
      </section>

      <Card className="px-5">
        <h2 className="pt-4 text-sm font-semibold">System check</h2>
        <ul className="divide-y">
          <StatusRow label="Signed in as" state="ok" detail={user.email} />
          <StatusRow label="API" state={health.state} detail={apiDetail} />
          <StatusRow
            label="Database"
            state={health.state}
            detail={health.state === 'ok' ? health.database : apiDetail}
          />
        </ul>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold">Coming next</h2>
        <ul className="mt-3 space-y-2 text-sm text-fg-muted">
          {UPCOMING.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}