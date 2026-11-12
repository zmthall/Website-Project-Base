// TODO [DB-02]: Add schema migrations, private-path validation for every store, consistent connection lifecycle, backups/restore tests and a documented multi-instance deployment strategy. See docs/integration-audit.md.
import { mkdirSync, chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createError } from 'h3';
import type {
  ManagedRecord,
  ManagedValue,
  ResourceKind,
  LocalAuthPolicy,
} from '../../shared/types/management';
export class ManagementStore {
  private db: DatabaseSync;
  constructor(filename: string) {
    mkdirSync(dirname(resolve(filename)), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(filename);
    chmodSync(filename, 0o600);
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(kind,id)); CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
    );
  }
  list(kind: ResourceKind): ManagedRecord[] {
    return this.db
      .prepare('SELECT data FROM records WHERE kind = ? ORDER BY rowid DESC')
      .all(kind)
      .map((row) => JSON.parse(String(row.data)));
  }
  get(kind: ResourceKind, id: string): ManagedRecord | undefined {
    const row = this.db.prepare('SELECT data FROM records WHERE kind = ? AND id = ?').get(kind, id);
    return row ? JSON.parse(String(row.data)) : undefined;
  }
  save(
    kind: ResourceKind,
    fields: Record<string, ManagedValue>,
    id?: string,
    version?: string,
  ): ManagedRecord {
    const previous = id ? this.get(kind, id) : undefined;
    if (id && !previous) throw createError({ statusCode: 404, statusMessage: 'Record not found' });
    if (previous && previous.version !== version)
      throw createError({
        statusCode: 409,
        statusMessage: 'This record changed. Reload it before saving.',
      });
    const now = new Date().toISOString();
    const record: ManagedRecord = {
      id: id || randomUUID(),
      version: randomUUID(),
      createdAt: previous?.createdAt || now,
      updatedAt: now,
      fields,
    };
    this.db
      .prepare('INSERT OR REPLACE INTO records (kind,id,data) VALUES (?,?,?)')
      .run(kind, record.id, JSON.stringify(record));
    return record;
  }
  remove(kind: ResourceKind, id: string, version: string) {
    const previous = this.get(kind, id);
    if (!previous) throw createError({ statusCode: 404 });
    if (previous.version !== version)
      throw createError({
        statusCode: 409,
        statusMessage: 'Record changed; reload before deleting',
      });
    this.db.prepare('DELETE FROM records WHERE kind = ? AND id = ?').run(kind, id);
  }
  policy(audience: 'admin' | 'customer'): LocalAuthPolicy {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(audience);
    return row
      ? JSON.parse(String(row.value))
      : { sessionDurationMinutes: 480, idleTimeoutMinutes: 30 };
  }
  savePolicy(audience: 'admin' | 'customer', policy: LocalAuthPolicy) {
    this.db
      .prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)')
      .run(audience, JSON.stringify(policy));
  }
  close() {
    this.db.close();
  }
}
let instance: ManagementStore | undefined;
export function managementStore() {
  return (instance ??= new ManagementStore(
    process.env.NUXT_MANAGEMENT_DATABASE || '.data/management.sqlite',
  ));
}
