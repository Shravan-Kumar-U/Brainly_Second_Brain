import { Navigate, Outlet, useLocation } from 'react-router';

import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuth } from '@/hooks/useAuth';

export default function PublicRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader />;

  if (status === 'authenticated') {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search}${from.hash}` : '/';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}