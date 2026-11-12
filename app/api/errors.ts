// TODO [OPS-01]: Add trusted proxy/HTTPS configuration, tailored CSP and redacted metrics/error reporting; exercise provider timeout/retry behavior and prevent secrets in browser/build artifacts. See docs/integration-audit.md.
import type { ApiFieldErrors } from './types';

export type ApiErrorKind =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not-found'
  | 'conflict'
  | 'rate-limit'
  | 'server'
  | 'http'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'unknown';

const messages: Record<ApiErrorKind, string> = {
  validation: 'Please check the submitted information.',
  authentication: 'Please sign in to continue.',
  authorization: 'You do not have permission to do that.',
  'not-found': 'The requested resource was not found.',
  conflict: 'The request conflicts with the current resource.',
  'rate-limit': 'Too many requests. Please try again later.',
  server: 'The service is temporarily unavailable.',
  http: 'The request could not be completed.',
  network: 'Unable to connect to the service.',
  timeout: 'The request timed out. Please try again.',
  cancelled: 'The request was cancelled.',
  unknown: 'An unexpected error occurred.',
};

export class ApiError extends Error {
  override readonly name = 'ApiError';
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
    public readonly code?: string,
    public readonly fieldErrors?: ApiFieldErrors,
  ) {
    super(messages[kind]);
  }
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

/** Never retain raw errors, request headers, URLs, stacks, or backend messages. */
export function normalizeApiError(error: unknown, signal?: AbortSignal): ApiError {
  if (error instanceof ApiError) return error;
  const source = record(error);
  const response = record(source.response);
  const status =
    typeof response.status === 'number'
      ? response.status
      : typeof source.statusCode === 'number'
        ? source.statusCode
        : undefined;
  const cause = record(source.cause);
  let kind: ApiErrorKind;
  if (status && status >= 400) {
    kind =
      (
        {
          400: 'validation',
          401: 'authentication',
          403: 'authorization',
          404: 'not-found',
          409: 'conflict',
          422: 'validation',
          429: 'rate-limit',
        } as Record<number, ApiErrorKind>
      )[status] ?? (status >= 500 ? 'server' : 'http');
  } else if (
    source.name === 'TimeoutError' ||
    cause.name === 'TimeoutError' ||
    record(signal?.reason).name === 'TimeoutError'
  ) {
    kind = 'timeout';
  } else if (signal?.aborted || source.name === 'AbortError' || cause.name === 'AbortError') {
    kind = 'cancelled';
  } else {
    kind = source.name === 'FetchError' ? 'network' : 'unknown';
  }
  const data = record(source.data);
  const fields: ApiFieldErrors = Object.create(null);
  if (kind === 'validation') {
    for (const [key, value] of Object.entries(record(data.errors))) {
      // Preserve field identity but never display untrusted backend diagnostics.
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        fields[key] = ['Please check this field.'];
      }
    }
  }
  const code =
    typeof data.code === 'string' && /^[\w.-]{1,100}$/.test(data.code) ? data.code : undefined;
  return new ApiError(kind, status, code, Object.keys(fields).length ? fields : undefined);
}
