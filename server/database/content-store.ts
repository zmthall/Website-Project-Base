import type { ManagedRecord, ManagedValue, ResourceKind } from '../../shared/types/management';
import { randomUUID } from 'node:crypto';
import { createError } from 'h3';
import type { DatabaseExecutor } from './postgres';

export interface ContentDatabase {
  query: DatabaseExecutor;
  transaction<T>(operation: (query: DatabaseExecutor) => Promise<T>): Promise<T>;
}

function timestamp(value: unknown) {
  return new Date(String(value)).toISOString();
}

export class ManagedContentRepository {
  constructor(
    readonly kind: ResourceKind,
    private readonly database: ContentDatabase,
  ) {}

  private map(row: Record<string, unknown>): ManagedRecord {
    return {
      id: String(row.id),
      version: String(row.version),
      createdAt: timestamp(row.created_at),
      updatedAt: timestamp(row.updated_at),
      fields: structuredClone(row.fields as Record<string, ManagedValue>),
    };
  }

  async list(): Promise<ManagedRecord[]> {
    const result = await this.database.query(
      `SELECT id, version, created_at, updated_at, fields
       FROM managed_content
       WHERE kind = $1
       ORDER BY updated_at DESC`,
      [this.kind],
    );
    return result.rows.map((row) => this.map(row));
  }

  async get(id: string): Promise<ManagedRecord | undefined> {
    const result = await this.database.query(
      `SELECT id, version, created_at, updated_at, fields
       FROM managed_content
       WHERE kind = $1 AND id = $2`,
      [this.kind, id],
    );
    return result.rows[0] ? this.map(result.rows[0]) : undefined;
  }

  async save(
    fields: Record<string, ManagedValue>,
    id?: string,
    version?: string,
  ): Promise<ManagedRecord> {
    if (id) {
      const result = await this.database.query(
        `UPDATE managed_content
         SET version = $4, fields = $5, updated_at = now()
         WHERE kind = $1 AND id = $2 AND version = $3
         RETURNING id, version, created_at, updated_at, fields`,
        [this.kind, id, version, randomUUID(), structuredClone(fields)],
      );
      if (!result.rows[0])
        throw createError({
          statusCode: 409,
          statusMessage: 'Record changed; reload before saving',
        });
      return this.map(result.rows[0]);
    }
    const result = await this.database.query(
      `INSERT INTO managed_content (kind, id, version, fields)
       VALUES ($1, $2, $3, $4)
       RETURNING id, version, created_at, updated_at, fields`,
      [this.kind, randomUUID(), randomUUID(), structuredClone(fields)],
    );
    return this.map(result.rows[0]!);
  }

  async remove(id: string, version: string): Promise<void> {
    const result = await this.database.query(
      `DELETE FROM managed_content
       WHERE kind = $1 AND id = $2 AND version = $3
       RETURNING id`,
      [this.kind, id, version],
    );
    if (!result.rows[0])
      throw createError({
        statusCode: 409,
        statusMessage: 'Record missing or changed; reload before deleting',
      });
  }
}

export function createManagedContentRepository(
  kind: ResourceKind,
  database: ContentDatabase,
) {
  return new ManagedContentRepository(kind, database);
}
