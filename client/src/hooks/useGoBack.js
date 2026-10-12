import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useGoBack(fallback = '/') {
  const navigate = useNavigate();
  const location = useLocation();

  // React Router marks the first page of a session with the key "default".
  // Going "back" from there would leave the app, so we go to the fallback instead.
  const canGoBack = location.key !== 'default';

  return useCallback(() => {
    if (canGoBack) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [canGoBack, fallback, navigate]);
}