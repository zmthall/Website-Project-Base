import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactApi } from '..';
import type { ApiClient, ApiRequestOptions } from '../../../app/api/types';
import { ApiError } from '../../../app/api/errors';

test('contact requests require the feature and retain their idempotency key', async () => {
  const calls: { path: string; options?: ApiRequestOptions }[] = [];
  const api: ApiClient = async <T>(path: string, options?: ApiRequestOptions) => {
    calls.push({ path, options });
    return {} as T;
  };
  const inquiry = { name: 'A', email: 'a@b.test', message: 'Hello' };
  const key = 'test-idempotency-key-1234';

  await assert.rejects(
    createContactApi(api, false).submit(inquiry, { idempotencyKey: key }),
    (error: unknown) => error instanceof ApiError && error.code === 'feature-disabled',
  );
  assert.equal(calls.length, 0);
  await createContactApi(api).submit(inquiry, { idempotencyKey: key });
  assert.equal(calls[0]?.path, '/contact');
  assert.equal(new Headers(calls[0]?.options?.headers).get('Idempotency-Key'), key);
});
