import { useCallback, useEffect, useMemo, useState } from 'react';

import { authApi } from '@/api/auth.api';
import { AUTH_EXPIRED_EVENT } from '@/api/client';
import { tokenStorage } from '@/lib/tokenStorage';
import { AuthContext } from './auth-context';
import { queryClient } from '@/lib/queryClient';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() =>
    tokenStorage.hasSession() ? 'loading' : 'unauthenticated'
  );

  const fetchUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus('authenticated');
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        setStatus('unauthenticated');
      } else {
        setStatus('error'); // server down or offline: keep the session
      }
    }
  }, []);

  // On app start, restore the session if we have saved tokens
  useEffect(() => {
    if (tokenStorage.hasSession()) fetchUser();
  }, [fetchUser]);

  // The API layer announces when the session is truly dead (refresh rejected)
  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      setUser(null);
      setStatus('unauthenticated');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    tokenStorage.set(data);
    queryClient.clear();
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    tokenStorage.set(data);
    setUser(data.user);
    queryClient.clear();
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefresh();

    // Sign out locally first so the UI responds instantly
    tokenStorage.clear();
    queryClient.clear();
    setUser(null);
    setStatus('unauthenticated');

    if (refreshToken) {
      try {
        await authApi.logout(refreshToken); // revoke it on the server too
      } catch {
        /* best effort: the token expires on its own anyway */
      }
    }
  }, []);

  const retry = useCallback(() => {
    setStatus('loading');
    fetchUser();
  }, [fetchUser]);

  const value = useMemo(
    () => ({ user, status, login, register, logout, retry }),
    [user, status, login, register, logout, retry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}