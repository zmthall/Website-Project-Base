import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectScope } from 'vue';
import { createFeatureApis } from '../app/features/api';
import type { ApiClient, ApiRequestOptions } from '../app/api/types';
import { ApiError } from '../app/api/errors';
import { resourceID } from '../app/features/_shared/transport';
import { useFeatureRequest } from '../app/features/_shared/useFeatureRequest';
import { searchDocuments } from '../app/features/search/utils';
import { validateUploads } from '../app/features/uploads/utils';
import { useUploads } from '../app/features/uploads/useUploads';
const key = 'test-idempotency-key-1234';
test('feature flags block requests and submissions retain idempotency keys', async () => {
  const calls: { path: string; options?: ApiRequestOptions }[] = [];
  const api: ApiClient = async <T>(path: string, options?: ApiRequestOptions) => {
    calls.push({ path, options });
    return {} as T;
  };
  const inquiry = { name: 'A', email: 'a@b.test', message: 'Hello' };
  await assert.rejects(
    createFeatureApis(api).contact.submit(inquiry, { idempotencyKey: key }),
    (e: unknown) => e instanceof ApiError && e.code === 'feature-disabled',
  );
  assert.equal(calls.length, 0);
  await createFeatureApis(api, { contact: true }).contact.submit(inquiry, { idempotencyKey: key });
  assert.equal(new Headers(calls[0]?.options?.headers).get('Idempotency-Key'), key);
  assert.throws(() => resourceID('../other'));
});
test('request state discards stale responses and keeps cancellation separate from success', async () => {
  let completeFirst: (value: string) => void = () => {};
  const state = useFeatureRequest<string, number>((n) =>
    n === 1
      ? new Promise((resolve) => {
          completeFirst = resolve;
        })
      : Promise.resolve('second'),
  );
  const first = state.execute(1);
  await state.execute(2);
  completeFirst('first');
  await first;
  assert.equal(state.data.value, 'second');
  assert.equal(state.status.value, 'success');
  const cancelled = state.execute(1);
  state.cancel();
  completeFirst('too late');
  await cancelled;
  assert.equal(state.status.value, 'cancelled');
  assert.equal(state.data.value, undefined);
});
test('search normalizes, filters, paginates, and excludes unsafe paths', () => {
  const docs = Array.from({ length: 12 }, (_, i) => ({
    id: String(i),
    title: `Local service ${i}`,
    description: 'Reliable business',
    type: 'service',
    path: `/services/${i}`,
  }));
  docs.push({
    id: 'bad',
    title: 'Local service',
    description: '',
    type: 'service',
    path: '//evil.test',
  });
  const result = searchDocuments(docs, {
    q: '  LOCAL   service ',
    type: 'service',
    page: 2,
    pageSize: 5,
  });
  assert.equal(result.total, 12);
  assert.equal(result.items.length, 5);
  assert.equal(searchDocuments(docs, { q: 'x' }).total, 0);
  assert.equal(searchDocuments(docs, { q: 'local', type: 'article' }).total, 0);
});
test('uploads enforce size/type/count and retry a failed transfer with the same mutation key', async () => {
  const policy = { maxBytes: 20, maxFiles: 1, mimeTypes: ['text/plain'], extensions: ['.txt'] };
  assert.ok(
    validateUploads([{ name: 'bad.exe', size: 50, type: 'text/plain' }], policy).length === 2,
  );
  let attempts = 0;
  const keys: string[] = [];
  const scope = effectScope();
  const upload = scope.run(() =>
    useUploads(
      {
        initialize: async (_body, options) => {
          keys.push(options.idempotencyKey);
          return {
            id: 'upload-1',
            contentPath: '/api/uploads/upload-1/content',
            expiresAt: '2099-01-01',
          };
        },
        complete: async () => ({
          id: 'upload-1',
          name: 'ok.txt',
          size: 2,
          mimeType: 'text/plain',
          status: 'ready',
        }),
        status: async () => {
          throw new Error('not called');
        },
        remove: async () => {},
      },
      policy,
      async (_path, _file, _signal, progress) => {
        attempts++;
        if (attempts === 1) throw new ApiError('network');
        progress({ loaded: 2, total: 2, percent: 100 });
      },
    ),
  )!;
  assert.deepEqual(upload.add([new File(['ok'], 'ok.txt', { type: 'text/plain' })]), []);
  const id = upload.items.value[0]!.key;
  await upload.start(id);
  assert.equal(upload.items.value[0]?.status, 'failed');
  await upload.retry(id);
  assert.equal(upload.items.value[0]?.status, 'complete');
  assert.equal(keys[0], keys[1]);
  scope.stop();
});
