import { Pool } from 'pg';
import type { DatabaseConfig } from '../utils/integration-config';
import { databaseMigrations, type DatabaseMigration } from './migrations';

type QueryResultLike = { rows: Array<Record<string, unknown>> };
export type DatabaseExecutor = (
  sql: string,
  values?: unknown[],
) => Promise<QueryResultLike>;

export interface PostgresClientLike {
  query(sql: string, values?: unknown[]): Promise<QueryResultLike>;
  release(): void;
}

export interface PostgresPoolLike {
  connect(): Promise<PostgresClientLike>;
  query(sql: string, values?: unknown[]): Promise<QueryResultLike>;
  end(): Promise<void>;
}

export type DatabaseReadiness = {
  driver: 'postgres';
  status: 'starting' | 'ready' | 'failed' | 'stopped';
};

function connectionString(config: DatabaseConfig) {
  const url = new URL(config.url);
  url.searchParams.set('sslmode', config.tls);
  url.searchParams.set('uselibpqcompat', 'true');
  return url.toString();
}

function defaultPool(config: DatabaseConfig): PostgresPoolLike {
  return new Pool({
    connectionString: connectionString(config),
    max: config.poolMax,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    application_name: 'website-project-base',
  }) as unknown as PostgresPoolLike;
}

export class PostgresAdapter {
  private state: DatabaseReadiness['status'] = 'stopped';

  constructor(
    private readonly pool: PostgresPoolLike,
    private readonly migrations: readonly DatabaseMigration[],
  ) {}

  readiness(): DatabaseReadiness {
    return { driver: 'postgres', status: this.state };
  }

  async start() {
    if (this.state === 'ready') return;
    this.state = 'starting';
    let client: PostgresClientLike | undefined;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('website-project-base:migrations'))",
      );
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_migrations (
          id text PRIMARY KEY,
          applied_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      const applied = await client.query('SELECT id FROM app_migrations');
      const appliedIds = new Set(applied.rows.map((row) => String(row.id)));
      for (const migration of this.migrations) {
        if (appliedIds.has(migration.id)) continue;
        await client.query(migration.sql);
        await client.query('INSERT INTO app_migrations (id) VALUES ($1)', [migration.id]);
      }
      await client.query('COMMIT');
      this.state = 'ready';
    } catch (error) {
      await client?.query('ROLLBACK').catch(() => undefined);
      this.state = 'failed';
      throw error;
    } finally {
      client?.release();
    }
  }

  async query(sql: string, values?: unknown[]) {
    if (this.state !== 'ready') throw new Error('Database adapter is not ready');
    return this.pool.query(sql, values);
  }

  async transaction<T>(operation: (query: DatabaseExecutor) => Promise<T>): Promise<T> {
    if (this.state !== 'ready') throw new Error('Database adapter is not ready');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await operation((sql, values) => client.query(sql, values));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async stop() {
    await this.pool.end();
    this.state = 'stopped';
  }
}

export function createPostgresAdapter(
  config: DatabaseConfig,
  options: {
    pool?: PostgresPoolLike;
    migrations?: readonly DatabaseMigration[];
  } = {},
) {
  if (config.driver !== 'postgres') throw new Error('PostgreSQL database driver is not selected');
  return new PostgresAdapter(
    options.pool ?? defaultPool(config),
    options.migrations ?? databaseMigrations,
  );
}
