import { Navigate, Outlet, useLocation } from 'react-router';

import { ConnectionError } from '@/components/ui/ConnectionError';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'error') return <ConnectionError onRetry={retry} />;

  // Remember where the user was heading, so login can send them back there
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}