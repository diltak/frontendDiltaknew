/**
 * api-client.ts
 * Shared helper for calling the backend.
 *
 * Token refresh strategy:
 * - On any 401 response, attempt POST /api/auth/refresh with the stored
 *   refresh_token.
 * - If refresh succeeds: persist the new tokens, update the failed request's
 *   Authorization header and retry it transparently.
 * - If refresh fails (no token, or API returns non-2xx): clear all stored
 *   auth data and redirect to /auth/login.
 *
 * Only one refresh call is ever in-flight at a time (queued via a promise
 * so concurrent 401s don't trigger multiple refresh attempts).
 */

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import ServerAddress from '@/constent/ServerAddress';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('login_data');
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  clearAuth();
  window.location.href = '/auth/login';
}

// ── Axios instance ────────────────────────────────────────────────────────────

export const axiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Token refresh queue ───────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(err: unknown, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else if (token) resolve(token);
  });
  refreshQueue = [];
}

// ── Response interceptor with auto-refresh ────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 once per request; skip the refresh endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `API error ${error.response?.status ?? ''}`;
      return Promise.reject(new Error(detail));
    }

    const storedRefreshToken = getRefreshToken();

    if (!storedRefreshToken) {
      // No refresh token available — go to login immediately
      redirectToLogin();
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    if (isRefreshing) {
      // Another request is already refreshing — queue this one
      return new Promise<AxiosResponse>((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    // Mark as refreshing
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${ServerAddress}/auth/refresh`,
        { refresh_token: storedRefreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      // API returns { access_token, refresh_token? }
      const newAccessToken: string = data.access_token;
      const newRefreshToken: string | undefined = data.refresh_token;

      if (!newAccessToken) throw new Error('No access token in refresh response');

      setTokens(newAccessToken, newRefreshToken);
      processQueue(null, newAccessToken);

      // Retry the original request with the new token
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(new Error('Session expired. Please log in again.'));
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Public request helper ────────────────────────────────────────────────────

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Authenticated API request.
 * Automatically retries once after a transparent token refresh on 401.
 * Throws an Error with `message` set to the API detail string on failure.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const url = path.startsWith('http') ? path : `${ServerAddress}${path}`;

  const config: AxiosRequestConfig = { method, url, headers, data: body };
  const response: AxiosResponse<T> = await axiosInstance.request(config);
  return response.data;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const apiGet    = <T>(path: string)                  => apiRequest<T>(path);
export const apiPost   = <T>(path: string, body: unknown)   => apiRequest<T>(path, { method: 'POST',   body });
export const apiPatch  = <T>(path: string, body: unknown)   => apiRequest<T>(path, { method: 'PATCH',  body });
export const apiPut    = <T>(path: string, body: unknown)   => apiRequest<T>(path, { method: 'PUT',    body });
export const apiDelete = <T>(path: string)                  => apiRequest<T>(path, { method: 'DELETE' });
