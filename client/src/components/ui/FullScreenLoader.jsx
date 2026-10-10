import { Loader2 } from 'lucide-react';

export function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading">
      <Loader2 className="size-8 animate-spin text-brand-500" />
    </div>
  );
}