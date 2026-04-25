/**
 * Typed HTTP client for the Go backend (restaurantsaas).
 * All browser-side fetches go through here.
 *
 * The browser persists the JWT in localStorage. Server-side Next.js routes
 * that need to call the backend should pass an explicit token.
 */

import { RESTAURANT_ID } from '../config';

export type ApiError = {
  status: number;
  error: string;
};

const TOKEN_KEY = 'rs_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function apiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || url.trim() === '') {
    // Fallback when running locally with `docker compose up`.
    return 'http://localhost:8080';
  }
  return url.replace(/\/+$/, '');
}

/**
 * This customer deployment is pinned to exactly one restaurant via the
 * NEXT_PUBLIC_RESTAURANT_ID env var (the restaurant's ObjectID hex).
 * Throws loudly if unset — misconfiguration should fail fast, not 404 later.
 */
function tenantId(): string {
  if (!RESTAURANT_ID) {
    throw new Error('NEXT_PUBLIC_RESTAURANT_ID is not set');
  }
  return RESTAURANT_ID;
}

type RequestOptions = RequestInit & {
  token?: string | null;
  /** Skip Authorization header even if a token is present. */
  anonymous?: boolean;
  /** Raw JSON body to stringify. */
  json?: unknown;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  if (opts.json !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (!opts.anonymous) {
    const token = opts.token ?? getStoredToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  const body = opts.json !== undefined ? JSON.stringify(opts.json) : opts.body;
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...opts,
    headers,
    body,
  });
  if (res.status === 204) {
    return undefined as T;
  }
  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof payload === 'object' && payload && 'error' in payload
      ? String((payload as { error: unknown }).error)
      : typeof payload === 'string'
        ? payload
        : 'request failed';
    const err: ApiError = { status: res.status, error: msg };
    throw err;
  }
  return payload as T;
}

/** Build `/api/r/:slug/...` path for the configured tenant. */
export function tenantPath(suffix: string): string {
  return `/api/r/${encodeURIComponent(tenantId())}${suffix.startsWith('/') ? '' : '/'}${suffix}`;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', json: body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', json: body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', json: body }),
  del: <T = void>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

export function isApiError(e: unknown): e is ApiError {
  return !!e && typeof e === 'object' && 'status' in e && 'error' in e;
}

/** Build a WebSocket URL for the backend, using the stored JWT on admin channels. */
export function wsUrl(suffix: string, { token }: { token?: string | null } = {}): string {
  const base = apiBaseUrl().replace(/^http/, 'ws');
  const qs = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${base}${suffix.startsWith('/') ? suffix : `/${suffix}`}${qs}`;
}
