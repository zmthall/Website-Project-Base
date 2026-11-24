import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectScope } from 'vue';
import { ApiError } from '../app/api/errors';
import { resourceID } from '../feature-layers/_shared/transport';
import { useFeatureRequest } from '../feature-layers/_shared/useFeatureRequest';
import { parseSearchInput, searchDocuments } from '../feature-layers/search';
import { useUploads, validateUploads } from '../feature-layers/uploads';
test('resource IDs reject traversal paths', () => {
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
test('search prefixes select public website content scopes', () => {
  assert.deepEqual(parseSearchInput('@  service one '), { q: 'service one', scope: 'page' });
  assert.deepEqual(parseSearchInput('#launch news'), { q: 'launch news', scope: 'content' });
  assert.deepEqual(parseSearchInput('* community day'), { q: 'community day', scope: 'event' });
  assert.deepEqual(parseSearchInput('service one'), { q: 'service one', scope: 'all' });

  const documents = [
    {
      id: 'page',
      title: 'Launch information',
      description: 'A website page',
      path: '/about',
      type: 'page',
      scope: 'page',
    },
    {
      id: 'post',
      title: 'Launch news',
      description: 'A published post',
      path: '/blog/launch',
      type: 'blog',
      scope: 'content',
    },
    {
      id: 'event',
      title: 'Launch event',
      description: 'A public gathering',
      path: '/events',
      type: 'event',
      scope: 'event',
    },
  ] as const;

  assert.deepEqual(
    searchDocuments([...documents], { q: '@launch' }).items.map(({ id }) => id),
    ['page'],
  );
  assert.deepEqual(
    searchDocuments([...documents], { q: '#launch' }).items.map(({ id }) => id),
    ['post'],
  );
  assert.deepEqual(
    searchDocuments([...documents], { q: '*launch' }).items.map(({ id }) => id),
    ['event'],
  );
  assert.deepEqual(
    searchDocuments([...documents], { q: '*events' }).items.map(({ id }) => id),
    ['event'],
  );
  assert.equal(searchDocuments([...documents], { q: 'launch' }).total, 3);
});
test('uploads enforce size/type/count and retry a failed transfer with the same mutation key', async () => {
  const policy = { maxBytes: 20, maxFiles: 1, mimeTypes: ['text/plain'], extensions: ['.txt'] };
  assert.ok(
    validateUploads([{ name: 'bad.exe', size: 50, type: 'text/plain' }], policy).length === 2,
  );
  let attempts = 0;
  const keys: string[] = [];
  const removed: string[] = [];
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
        remove: async (uploadId) => {
          removed.push(uploadId);
        },
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
  await upload.remove(id);
  assert.deepEqual(removed, ['upload-1']);
  assert.equal(upload.items.value.length, 0);
  scope.stop();
});
test('uploads surface server inspection rejection as a failed item', async () => {
  const scope = effectScope();
  const upload = scope.run(() =>
    useUploads(
      {
        initialize: async () => ({
          id: 'rejected-upload',
          contentPath: '/api/uploads/rejected-upload/content',
          expiresAt: '2099-01-01',
        }),
        complete: async () => ({
          id: 'rejected-upload',
          name: 'unsafe.pdf',
          size: 8,
          mimeType: 'application/pdf',
          status: 'rejected',
        }),
        status: async () => {
          throw new Error('not called');
        },
        remove: async () => {},
      },
      {
        maxBytes: 20,
        maxFiles: 1,
        mimeTypes: ['application/pdf'],
        extensions: ['.pdf'],
      },
      async () => {},
    ),
  )!;
  upload.add([new File(['%PDF-1'], 'unsafe.pdf', { type: 'application/pdf' })]);

  await upload.start(upload.items.value[0]!.key);

  assert.equal(upload.items.value[0]?.status, 'failed');
  assert.match(upload.items.value[0]?.error ?? '', /rejected/i);
  scope.stop();
});
