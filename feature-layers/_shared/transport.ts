import type { ApiClient, ApiRequestOptions } from '../../app/api/types';
import { ApiError } from '../../app/api/errors';
import type { MutationOptions } from './types';
export function resourceID(id: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,199}$/.test(id))
    throw new ApiError('validation', 400, 'invalid-resource-id');
  return encodeURIComponent(id);
}
export function mutation(options: MutationOptions): ApiRequestOptions {
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(options.idempotencyKey))
    throw new ApiError('validation', 400, 'invalid-idempotency-key');
  return { signal: options.signal, headers: { 'Idempotency-Key': options.idempotencyKey } };
}
export function featureClient(api: ApiClient, enabled: boolean): ApiClient {
  return <T>(path: string, options?: ApiRequestOptions) => {
    if (!enabled) return Promise.reject(new ApiError('authorization', 403, 'feature-disabled'));
    return api<T>(path, options);
  };
}
export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
