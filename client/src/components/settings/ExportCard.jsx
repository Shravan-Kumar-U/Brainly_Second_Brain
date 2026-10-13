import { Download } from 'lucide-react';
import { useState } from 'react';

import { exportApi } from '@/api/export.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';

export function ExportCard() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const backup = await exportApi.download();

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brainly-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      toast.success(`Backed up ${backup.items.length} items`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
          <Download className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Back up your brain</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Download your links, notes, tags, collections and watch windows as one file. It contains no
            password and no share links. Restoring from a backup arrives in a later update.
          </p>
        </div>
      </div>

      <Button className="mt-4" variant="secondary" loading={busy} onClick={download}>
        <Download className="size-4" aria-hidden />
        Download my data
      </Button>
    </Card>
  );
}