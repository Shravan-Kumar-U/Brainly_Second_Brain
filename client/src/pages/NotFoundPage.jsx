import { Link } from 'react-router';

import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-6xl font-bold tracking-tight text-brand-500">404</p>
        <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
        <p className="mt-1.5 text-sm text-fg-muted">That page doesn't exist or was moved.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}