import { Copy, Lock, Share2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCollectionActions } from '@/hooks/useCollections';
import { useToast } from '@/hooks/useToast';

export function ShareCollectionPanel({ collection }) {
  const actions = useCollectionActions();
  const toast = useToast();
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);

  const url = collection.shareToken ? `${window.location.origin}/s/${collection.shareToken}` : '';
  const canNativeShare = typeof navigator.share === 'function';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.info('Select the link and copy it manually');
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: collection.name, text: `${collection.name} on Brainly`, url });
    } catch {
      /* the person closed the share sheet */
    }
  };

  const regenerate = () => {
    if (!confirmingRegenerate) {
      setConfirmingRegenerate(true);
      return;
    }
    setConfirmingRegenerate(false);
    actions.regenerate.mutate(collection._id);
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
          <Share2 className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Share this collection</h2>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-fg-muted">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Anyone with the link can see the titles, thumbnails and links. Your notes, tags and reminder
            times stay private.
          </p>
        </div>
      </div>

      {collection.isShared ? (
        <div className="mt-4 space-y-3">
          <input
            readOnly
            value={url}
            aria-label="Share link"
            onFocus={(event) => event.target.select()}
            className="h-11 w-full rounded-xl border bg-surface-2 px-3.5 text-base text-fg sm:text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={copy}>
              <Copy className="size-4" aria-hidden />
              Copy link
            </Button>
            {canNativeShare && (
              <Button size="sm" variant="secondary" onClick={nativeShare}>
                <Share2 className="size-4" aria-hidden />
                Share…
              </Button>
            )}
            <Button
              size="sm"
              variant={confirmingRegenerate ? 'danger' : 'secondary'}
              loading={actions.regenerate.isPending}
              onClick={regenerate}
            >
              {confirmingRegenerate ? 'Yes, replace the link' : 'New link'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              loading={actions.unshare.isPending}
              onClick={() => actions.unshare.mutate(collection._id)}
            >
              Stop sharing
            </Button>
          </div>

          {confirmingRegenerate && (
            <p className="text-xs text-fg-muted">The current link will stop working for everyone.</p>
          )}
        </div>
      ) : (
        <Button className="mt-4" loading={actions.share.isPending} onClick={() => actions.share.mutate(collection._id)}>
          Create share link
        </Button>
      )}
    </Card>
  );
}