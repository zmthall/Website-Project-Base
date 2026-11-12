import type { FetchOptions } from 'ofetch';

export type ApiQueryValue = string | number | boolean | null | undefined;
export type ApiQuery = Record<string, ApiQueryValue | ApiQueryValue[]>;
export type ApiFieldErrors = Record<string, string[]>;

/** Optional backend envelope; the client never wraps or unwraps responses. */
export interface ApiResponse<T> {
  data: T;
}

/** An opt-in backend contract. Messages must be safe for display. */
export interface ApiErrorResponse {
  code?: string;
  message?: string;
  errors?: ApiFieldErrors;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  query?: ApiQuery;
  body?: FetchOptions<'json'>['body'];
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeout?: number;
  /** Attach a token from the injected auth adapter only when requested. */
  auth?: boolean;
}

export interface ApiClient {
  <T = unknown>(path: string, options?: ApiRequestOptions): Promise<T>;
}
