import { Navigate, Outlet } from 'react-router';

import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuth } from '@/hooks/useAuth';

export default function PublicRoute() {
  const { status } = useAuth();

  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') return <Navigate to="/" replace />;

  return <Outlet />;
}