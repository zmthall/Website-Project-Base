import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPostgresAdapter,
  databaseQuery,
  databaseReadiness,
  initializeDatabase,
  parseDatabaseConfig,
  stopDatabase,
} from '../server/utils/integration-config';
import { databaseMigrations } from '../server/database/migrations';

test('database migrations provision isolated managed content records', () => {
  const migration = databaseMigrations.find(({ id }) => id === '0002_managed_content');
  assert.ok(migration);
  assert.match(migration.sql, /CREATE TABLE IF NOT EXISTS managed_content/);
  assert.match(migration.sql, /PRIMARY KEY \(kind, id\)/);
});

test('legacy import selects only public editorial records and blog posts', async () => {
  const { prepareLegacyContent } = await import('../server/database/legacy-content-import');
  const selected = prepareLegacyContent(
    [
      {
        kind: 'reviews',
        data: JSON.stringify({
          id: 'review-1',
          version: 'version-1',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
          fields: { name: 'Jane', rating: 5, status: 'published' },
        }),
      },
      {
        kind: 'messages',
        data: JSON.stringify({
          id: 'private-message',
          version: 'version-1',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
          fields: { email: 'private@example.com' },
        }),
      },
    ],
    [
      {
        id: 'post-1',
        version: 'version-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        title: 'Imported post',
        slug: 'imported-post',
        content: '# Imported',
        featured: 1,
      },
    ],
  );

  assert.deepEqual(selected.map(({ kind, id }) => [kind, id]), [
    ['reviews', 'review-1'],
    ['blog', 'post-1'],
  ]);
  assert.equal(selected[1]?.fields.featured, true);
});

test('PostgreSQL adapter connects, applies pending migrations, and closes cleanly', async () => {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  let released = 0;
  let ended = 0;
  const client = {
    async query(sql: string, values?: unknown[]) {
      calls.push({ sql, values });
      if (sql.includes('SELECT id FROM app_migrations')) return { rows: [] };
      return { rows: [] };
    },
    release() {
      released++;
    },
  };
  const pool = {
    async connect() {
      return client;
    },
    async query(sql: string, values?: unknown[]) {
      return client.query(sql, values);
    },
    async end() {
      ended++;
    },
  };
  const config = parseDatabaseConfig({
    driver: 'postgres',
    url: 'postgresql://website_app:secret@127.0.0.1:5432/website_base',
    tls: 'disable',
    poolMax: 4,
  });
  const adapter = createPostgresAdapter(config, {
    pool,
    migrations: [{ id: '0001_test', sql: 'CREATE TABLE adapter_test (id integer)' }],
  });

  await adapter.start();

  assert.deepEqual(adapter.readiness(), { driver: 'postgres', status: 'ready' });
  assert.equal(released, 1);
  assert.ok(calls.some(({ sql }) => sql === 'CREATE TABLE adapter_test (id integer)'));
  assert.ok(
    calls.some(
      ({ sql, values }) =>
        sql.includes('INSERT INTO app_migrations') && values?.[0] === '0001_test',
    ),
  );
  await adapter.stop();
  assert.equal(ended, 1);
  assert.deepEqual(adapter.readiness(), { driver: 'postgres', status: 'stopped' });
});

test('PostgreSQL adapter reports failed readiness when connection startup fails', async () => {
  let ended = 0;
  const config = parseDatabaseConfig({
    driver: 'postgres',
    url: 'postgresql://website_app:secret@127.0.0.1:5432/website_base',
    tls: 'disable',
    poolMax: 4,
  });
  const adapter = createPostgresAdapter(config, {
    pool: {
      async connect() {
        throw new Error('connection refused for secret URL');
      },
      async query() {
        return { rows: [] };
      },
      async end() {
        ended++;
      },
    },
    migrations: [],
  });

  await assert.rejects(adapter.start(), /connection refused/);
  assert.deepEqual(adapter.readiness(), { driver: 'postgres', status: 'failed' });
  assert.ok(!JSON.stringify(adapter.readiness()).includes('secret'));
  await adapter.stop();
  assert.equal(ended, 1);
});

test('database lifecycle selects PostgreSQL and publishes sanitized readiness', async () => {
  let ended = 0;
  const poolQueries: string[] = [];
  const client = {
    async query() {
      return { rows: [] };
    },
    release() {},
  };
  await initializeDatabase(
    {
      driver: 'postgres',
      url: 'postgresql://website_app:secret@127.0.0.1:5432/website_base',
      tls: 'disable',
      poolMax: '3',
    },
    {
      pool: {
        async connect() {
          return client;
        },
        async query(sql: string) {
          poolQueries.push(sql);
          return { rows: [] };
        },
        async end() {
          ended++;
        },
      },
      migrations: [],
    },
  );

  assert.deepEqual(databaseReadiness(), { driver: 'postgres', status: 'ready' });
  assert.ok(!JSON.stringify(databaseReadiness()).includes('secret'));
  await databaseQuery('SELECT 42');
  assert.deepEqual(poolQueries, ['SELECT 42']);
  await stopDatabase();
  assert.equal(ended, 1);
  assert.deepEqual(databaseReadiness(), { driver: 'memory', status: 'disabled' });
});
