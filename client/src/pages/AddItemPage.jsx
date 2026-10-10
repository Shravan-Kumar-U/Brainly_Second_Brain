import { ClipboardPaste, Link2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { LinkPreviewCard } from '@/components/items/LinkPreviewCard';
import { SchedulePicker } from '@/components/items/SchedulePicker';
import { TagInput } from '@/components/items/TagInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateItem, useLinkPreview, useTags } from '@/hooks/useItems';
import { useToast } from '@/hooks/useToast';
import { formatDuration, formatRelative, formatWhen, isPastDate } from '@/lib/time';
import { extractUrl, isHttpUrl, normalizeInputUrl } from '@/lib/url';

const DURATION_CHOICES = [null, 5, 10, 15, 30, 60];

function Section({ title, hint, children }) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-fg-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export default function AddItemPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  // Android's share menu (Phase 7) will open /add?url=... or /add?text=...
  const [rawUrl, setRawUrl] = useState(
    () => searchParams.get('url') || extractUrl(searchParams.get('text') ?? '')
  );
  const [scheduledAt, setScheduledAt] = useState(null);
  const [duration, setDuration] = useState(null);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState('');

  const url = normalizeInputUrl(rawUrl);
  const valid = isHttpUrl(url);
  const debouncedUrl = useDebounce(valid ? url : '', 600);

  const preview = useLinkPreview(debouncedUrl);
  const savedTags = useTags();
  const create = useCreateItem();

  let previewState = 'idle';
  if (valid) {
    if (debouncedUrl !== url || preview.isPending) previewState = 'loading';
    else previewState = preview.isError ? 'error' : 'ready';
  }

  const detectedDuration = preview.data?.metadata?.durationMinutes;
  const pastTime = scheduledAt ? isPastDate(scheduledAt) : false;
  const canSave = valid && !pastTime && !create.isPending;

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawUrl(extractUrl(text) || text.trim());
    } catch {
      toast.info("Couldn't read the clipboard. Paste with Ctrl+V instead.");
    }
  };

  const save = (event) => {
    event.preventDefault();
    if (!canSave) return;

    create.mutate(
      {
        url,
        ...(scheduledAt && { scheduledAt: scheduledAt.toISOString() }),
        ...(tags.length > 0 && { tags }),
        ...(notes.trim() && { notes: notes.trim() }),
        ...(duration && { durationMinutes: duration }),
      },
      { onSuccess: () => navigate('/') }
    );
  };

  return (
    <div>
      <PageHeader
        title="Save a link"
        subtitle="Paste it, pick a time, and stop worrying about forgetting it."
      />

      <form onSubmit={save} noValidate className="grid gap-6 lg:grid-cols-5">
        <Section title="Link">
          <div className="flex gap-2">
            <Input
              icon={Link2}
              inputMode="url"
              autoFocus={!rawUrl}
              aria-label="Link"
              placeholder="https://youtube.com/watch?v=…"
              value={rawUrl}
              onChange={(event) => setRawUrl(event.target.value)}
              error={rawUrl.trim() && !valid ? 'Enter a valid link' : undefined}
              className="min-w-0 flex-1"
            />
            <Button variant="secondary" onClick={paste} aria-label="Paste from clipboard">
              <ClipboardPaste className="size-4" aria-hidden />
              <span className="hidden sm:inline">Paste</span>
            </Button>
          </div>
        </Section>

        <div className="lg:sticky lg:top-8 lg:col-start-4 lg:col-span-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <LinkPreviewCard
            state={previewState}
            data={preview.data}
            error={preview.error}
            url={url}
          />
        </div>

        <div className="space-y-6 lg:col-span-3 lg:col-start-1">
          <Section
            title="When will you watch it?"
            hint="No time yet? Skip this and it goes to your Inbox."
          >
            <SchedulePicker value={scheduledAt} onChange={setScheduledAt} />
            {scheduledAt && !pastTime && (
              <p className="mt-3 text-sm font-medium text-brand-700 dark:text-brand-300">
                Scheduled for {formatWhen(scheduledAt)}{' '}
                <span className="font-normal text-fg-muted">({formatRelative(scheduledAt)})</span>
              </p>
            )}
          </Section>

          <Section
            title="How long will it take?"
            hint={
              detectedDuration
                ? `Detected: ${formatDuration(detectedDuration)}. Leave on Auto to use it.`
                : 'Auto fills this in when Brainly can detect it. Powers the "I have time" filter.'
            }
          >
            <div className="flex flex-wrap gap-2">
              {DURATION_CHOICES.map((minutes) => (
                <Chip key={minutes ?? 'auto'} active={duration === minutes} onClick={() => setDuration(minutes)}>
                  {minutes === null ? 'Auto' : formatDuration(minutes)}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Tags and notes" hint="Future you will thank present you for a line of context.">
            <div className="space-y-4">
              <TagInput
                value={tags}
                onChange={setTags}
                suggestions={savedTags.data?.map((entry) => entry.tag) ?? []}
              />
              <Textarea
                aria-label="Notes"
                placeholder="Why does this matter? What are you hoping to learn?"
                maxLength={2000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </Section>

          <Alert>{create.error?.message}</Alert>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link to="/" className="sm:w-auto">
              <Button variant="ghost" fullWidth>
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="lg" loading={create.isPending} disabled={!canSave}>
              {scheduledAt ? 'Save & schedule' : 'Save to inbox'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}