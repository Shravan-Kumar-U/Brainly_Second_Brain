import axios from 'axios';

import { env } from '@/config/env';
import { tokenStorage } from '@/lib/tokenStorage';
import { ApiError } from './ApiError';

export const AUTH_EXPIRED_EVENT = 'brainly:auth-expired';

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// A separate instance WITHOUT interceptors, used only for refreshing.
// If refresh went through `http`, a failed refresh could trigger another refresh forever.
const bare = axios.create({ baseURL: env.apiUrl, timeout: 15000 });

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const toApiError = (error) => {
  if (error instanceof ApiError) return error;

  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(data?.message || 'Something went wrong', {
      status,
      details: data?.details ?? null,
    });
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiError('The request timed out. Please try again.');
  }

  return new ApiError("Can't reach the server. Check your connection.");
};

// SINGLE-FLIGHT refresh. Refresh tokens are one-time-use, so if several requests
// expire together they must all wait for ONE refresh instead of each starting their own.
let refreshPromise = null;

const refreshTokens = () => {
  if (!refreshPromise) {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) return Promise.reject(new Error('No refresh token'));

    refreshPromise = bare
      .post('/auth/refresh', { refreshToken })
      .then(({ data }) => {
        tokenStorage.set(data.data);
        return data.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const shouldRefresh =
      response?.status === 401 &&
      config &&
      !config._retried && // never retry twice
      !AUTH_PATHS.some((path) => config.url?.startsWith(path)) &&
      tokenStorage.getRefresh();

    if (!shouldRefresh) throw toApiError(error);

    let accessToken;
    try {
      accessToken = await refreshTokens();
    } catch (refreshError) {
      // Only a real rejection (401) ends the session. A network blip must not log you out.
      if (refreshError.response?.status === 401) {
        tokenStorage.clear();
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
      throw toApiError(refreshError);
    }

    config._retried = true;
    config.headers.Authorization = `Bearer ${accessToken}`;
    return http(config); // replay the original request with the new token
  }
);