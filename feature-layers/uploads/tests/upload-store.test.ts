import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalUploadStore } from '../server/utils/upload-store';

const directory = mkdtempSync(join(tmpdir(), 'website-uploads-'));
after(() => rmSync(directory, { recursive: true, force: true }));

test('a valid private upload becomes ready and resolves only for its owner', () => {
  const content = Buffer.from('%PDF-1.7\n%%EOF');
  const store = new LocalUploadStore({
    directory: join(directory, 'objects'),
    database: join(directory, 'uploads.sqlite'),
  });
  const request = {
    name: 'project.pdf',
    size: content.length,
    mimeType: 'application/pdf',
    temporary: true,
  } as const;
  const session = store.initialize('customer-a', request, 'initialize-key');

  assert.match(session.contentPath, new RegExp(`/api/uploads/${session.id}/content$`));
  store.putContent('customer-a', session.id, content);
  const metadata = store.complete('customer-a', session.id);

  assert.equal(metadata.status, 'ready');
  assert.equal(store.readClaimed(session.id), undefined);
  assert.deepEqual(store.resolve('customer-a', [session.id]), [
    {
      id: session.id,
      name: 'project.pdf',
      size: content.length,
      mimeType: 'application/pdf',
    },
  ]);
  assert.deepEqual(store.readClaimed(session.id)?.bytes, content);
  assert.deepEqual(store.resolve('customer-b', [session.id]), []);
  assert.throws(() => store.remove('customer-a', session.id));
  store.close();
});

test('upload initialization rejects invalid metadata and conflicting idempotency reuse', () => {
  const store = new LocalUploadStore({
    directory: join(directory, 'policy-objects'),
    database: join(directory, 'policy.sqlite'),
  });
  const valid = {
    name: 'photo.png',
    size: 8,
    mimeType: 'image/png',
    temporary: true,
  } as const;

  assert.throws(() => store.initialize('owner', { ...valid, name: '../photo.png' }, 'path'));
  assert.throws(() => store.initialize('owner', { ...valid, size: 0 }, 'empty'));
  assert.throws(() =>
    store.initialize('owner', { ...valid, mimeType: 'application/octet-stream' }, 'mime'),
  );
  store.initialize('owner', valid, 'same-key');
  assert.throws(() => store.initialize('owner', { ...valid, name: 'different.png' }, 'same-key'));
  store.close();
});

test('completion rejects content that disagrees with its declared safe file type', () => {
  const store = new LocalUploadStore({
    directory: join(directory, 'inspection-objects'),
    database: join(directory, 'inspection.sqlite'),
  });
  const executable = Buffer.from('MZnot-a-real-png');
  const session = store.initialize(
    'owner',
    {
      name: 'disguised.png',
      size: executable.length,
      mimeType: 'image/png',
      temporary: true,
    },
    'inspect-key',
  );
  store.putContent('owner', session.id, executable);

  const metadata = store.complete('owner', session.id);

  assert.equal(metadata.status, 'rejected');
  assert.deepEqual(store.resolve('owner', [session.id]), []);
  store.close();
});

test('ready content can only be read or removed by its owner', () => {
  const content = Buffer.from('%PDF-1.7\nprivate\n%%EOF');
  const store = new LocalUploadStore({
    directory: join(directory, 'ownership-objects'),
    database: join(directory, 'ownership.sqlite'),
  });
  const session = store.initialize(
    'owner-a',
    {
      name: 'private.pdf',
      size: content.length,
      mimeType: 'application/pdf',
      temporary: true,
    },
    'ownership-key',
  );
  store.putContent('owner-a', session.id, content);
  store.complete('owner-a', session.id);

  assert.equal(store.read('owner-b', session.id), undefined);
  assert.deepEqual(store.read('owner-a', session.id)?.bytes, content);
  assert.equal(store.remove('owner-b', session.id), false);
  assert.equal(store.remove('owner-a', session.id), true);
  assert.equal(store.read('owner-a', session.id), undefined);
  store.close();
});

test('owner quotas and expiry cleanup prevent abandoned uploads from accumulating', () => {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const store = new LocalUploadStore({
    directory: join(directory, 'expiry-objects'),
    database: join(directory, 'expiry.sqlite'),
    now: () => now,
    policy: { maxFilesPerOwner: 1, maxTotalBytesPerOwner: 20 },
  });
  const request = {
    name: 'project.pdf',
    size: 14,
    mimeType: 'application/pdf',
    temporary: true,
  } as const;
  const abandoned = store.initialize('owner', request, 'first');

  assert.throws(() => store.initialize('owner', request, 'second'));
  now += 60 * 60 * 1000 + 1;
  assert.equal(store.cleanupExpired(), 1);
  assert.equal(store.status('owner', abandoned.id), undefined);
  assert.doesNotThrow(() => store.initialize('owner', request, 'after-cleanup'));
  store.close();
});

test('a configured scanner can keep otherwise valid content quarantined and rejected', () => {
  const content = Buffer.from('%PDF-1.7\n%%EOF');
  const store = new LocalUploadStore({
    directory: join(directory, 'scanner-objects'),
    database: join(directory, 'scanner.sqlite'),
    scanner: { scan: () => ({ safe: false }) },
  });
  const session = store.initialize(
    'owner',
    {
      name: 'project.pdf',
      size: content.length,
      mimeType: 'application/pdf',
      temporary: true,
    },
    'scanner-key',
  );
  store.putContent('owner', session.id, content);

  assert.equal(store.complete('owner', session.id).status, 'rejected');
  store.close();
});

test('upload storage refuses paths exposed by the public asset directory', () => {
  assert.throws(
    () =>
      new LocalUploadStore({
        directory: resolve('public/uploads'),
        database: join(directory, 'unsafe.sqlite'),
      }),
  );
  assert.throws(
    () =>
      new LocalUploadStore({
        directory: join(directory, 'safe-objects'),
        database: resolve('public/uploads.sqlite'),
      }),
  );
});
