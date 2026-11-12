// TODO [API-01]: Reconcile external feature contracts with local routes, supply credentials only to trusted backends, and reject uninstalled operations instead of assuming every adapter endpoint exists. See docs/integration-audit.md.
import { $fetch, type FetchOptions } from 'ofetch';
import { normalizeApiError } from './errors';
import type { ApiClient, ApiRequestOptions } from './types';

export interface ApiClientConfig {
  baseURL: string;
  fetch?: <T>(
    path: string,
    options?: Omit<ApiRequestOptions, 'auth'> &
      Pick<FetchOptions<'json'>, 'baseURL' | 'retry' | 'credentials' | 'redirect'>,
  ) => Promise<T>;
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /** Notification only: refresh/retry and navigation belong to the auth feature. */
  onUnauthorized?: () => void | Promise<void>;
}

/** Create per Nuxt application/request; never keep auth state in a singleton. */
export function createApiClient(config: ApiClientConfig): ApiClient {
  const transport: NonNullable<ApiClientConfig['fetch']> = config.fetch ?? $fetch;
  return async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
    const { auth = false, headers: inputHeaders, ...request } = options;
    try {
      // Restrict callers to backend-relative endpoints, including encoded traversal.
      const decoded = decodeURIComponent(path.split(/[?#]/)[0]!);
      if (
        !path.startsWith('/') ||
        path.startsWith('//') ||
        /[\\\s#?]/.test(path) ||
        decoded.startsWith('//') ||
        /[\\?#]/.test(decoded) ||
        decoded.split('/').some((part) => part === '.' || part === '..')
      ) {
        throw new Error('API endpoint must be an absolute path within the configured backend.');
      }
      const headers = new Headers(inputHeaders);
      if (!headers.has('Accept')) headers.set('Accept', 'application/json');
      if (auth && !headers.has('Authorization')) {
        const token = await config.getToken?.();
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      return await transport<T>(path, {
        ...request,
        baseURL: config.baseURL,
        headers,
        timeout: request.timeout ?? 15_000,
        retry: 0,
        credentials: 'omit',
        redirect: 'error',
      });
    } catch (error) {
      const normalized = normalizeApiError(error, request.signal);
      if (auth && normalized.status === 401) {
        // An auth notification failure must not replace the transport error.
        try {
          await config.onUnauthorized?.();
        } catch {
          /* Preserve normalized error. */
        }
      }
      throw normalized;
    }
  };
}
