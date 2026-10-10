import { Navigate, Outlet } from 'react-router';

import { ConnectionError } from '@/components/ui/ConnectionError';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute() {
  const { status, retry } = useAuth();

  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'error') return <ConnectionError onRetry={retry} />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;

  return <Outlet />;
}