import type { H3Event } from 'h3';
import type { ServerIntegrations } from '../config/integrations';
import {
  createPostgresAdapter as createAdapter,
  type DatabaseExecutor,
  type PostgresAdapter,
  type PostgresPoolLike,
} from '../database/postgres';
import type { DatabaseMigration } from '../database/migrations';

export type DatabaseConfig = {
  driver: string;
  url: string;
  tls: string;
  poolMax: number;
};

export function parseDatabaseConfig(
  value: Omit<ServerIntegrations['database'], 'poolMax'> & { poolMax: number | string },
): DatabaseConfig {
  const poolMax = Number(value.poolMax);
  if (!['memory', 'postgres'].includes(value.driver))
    throw new Error('Unsupported database driver');
  if (!['disable', 'prefer', 'require', 'verify-ca', 'verify-full'].includes(value.tls))
    throw new Error('Unsupported database TLS mode');
  if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 50)
    throw new Error('Database pool size must be an integer from 1 to 50');
  if (value.driver === 'postgres') {
    let parsed: URL;
    try {
      parsed = new URL(value.url);
    } catch {
      throw new Error('PostgreSQL database URL is required');
    }
    if (
      !['postgres:', 'postgresql:'].includes(parsed.protocol) ||
      !parsed.hostname ||
      parsed.pathname === '/'
    )
      throw new Error('PostgreSQL database URL is invalid');
  }
  return { ...value, poolMax };
}

export function createPostgresAdapter(
  config: DatabaseConfig,
  options?: { pool?: PostgresPoolLike; migrations?: readonly DatabaseMigration[] },
) {
  return createAdapter(config, options);
}

let activeDatabase: PostgresAdapter | undefined;

export async function initializeDatabase(
  value: Omit<ServerIntegrations['database'], 'poolMax'> & { poolMax: number | string },
  options?: { pool?: PostgresPoolLike; migrations?: readonly DatabaseMigration[] },
) {
  await stopDatabase();
  const config = parseDatabaseConfig(value);
  if (config.driver === 'memory') return;
  activeDatabase = createPostgresAdapter(config, options);
  await activeDatabase.start();
}

export async function stopDatabase() {
  if (!activeDatabase) return;
  const database = activeDatabase;
  activeDatabase = undefined;
  await database.stop();
}

export function databaseReadiness() {
  return activeDatabase?.readiness() ?? ({ driver: 'memory', status: 'disabled' } as const);
}

export function databaseQuery(sql: string, values?: unknown[]) {
  if (!activeDatabase) throw new Error('PostgreSQL database adapter is not active');
  return activeDatabase.query(sql, values);
}

export function databaseTransaction<T>(
  operation: (query: DatabaseExecutor) => Promise<T>,
): Promise<T> {
  if (!activeDatabase) throw new Error('PostgreSQL database adapter is not active');
  return activeDatabase.transaction(operation);
}

/** Server-only access point. Do not serialize this value or its nested objects. */
export function serverIntegrations(event: H3Event): ServerIntegrations {
  return useRuntimeConfig(event).integrations;
}
// TODO [SECRETS-01]: Replace environment-backed retrieval with a scoped secret-manager resolver
// when deployments require rotation/auditing. Never return credential values to admin/client APIs.
// TODO [CONFIG-01]: Validate the selected adapter's required keys and supported environment before
// connecting; reject unsupported providers instead of silently falling back to the demo.
