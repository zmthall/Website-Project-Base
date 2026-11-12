// TODO [BLOG-01]: Add revisions/restore, author permissions, image upload integration and cache/index invalidation; fuzz the MDC/prose renderer against hostile and oversized content. See docs/integration-audit.md.
// TODO [DB-02]: Add schema migrations, private-path validation for every store, consistent connection lifecycle, backups/restore tests and a documented multi-instance deployment strategy. See docs/integration-audit.md.
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createError } from 'h3';
import { resources } from '../../shared/data/management';
import type { ManagedValue, BlogPost } from '../../shared/types/management';
import { renderMarkdown } from './markdown';
import { validateManagedFields, recordIsPublic } from './management-validation';
/** Markdown is plain TEXT; every editorial and SEO field has its own column. */
export class BlogStore {
  private db: DatabaseSync;
  private keys = resources.blog.fields.map((field) => field.key);
  constructor(filename: string) {
    mkdirSync(dirname(resolve(filename)), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(filename);
    chmodSync(filename, 0o600);
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, version TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, ${resources.blog.fields.map((field) => `"${field.key}" ${field.type === 'checkbox' ? 'INTEGER' : 'TEXT'} NOT NULL`).join(', ')}, UNIQUE(slug)); CREATE INDEX IF NOT EXISTS blog_publication ON blog_posts(status,publishedAt)`,
    );
  }
  private map(row: Record<string, unknown>): BlogPost {
    const fields: Record<string, ManagedValue> = {};
    for (const field of resources.blog.fields)
      fields[field.key] =
        field.type === 'checkbox' ? Boolean(row[field.key]) : String(row[field.key]);
    return {
      id: String(row.id),
      version: String(row.version),
      createdAt: String(row.createdAt),
      updatedAt: String(row.updatedAt),
      slug: String(fields.slug),
      fields,
      ...renderMarkdown(String(fields.content)),
    };
  }
  async get(slug: string) {
    const row = this.db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug);
    return row ? this.map(row) : undefined;
  }
  async list(publicOnly = false) {
    return this.db
      .prepare('SELECT * FROM blog_posts ORDER BY updatedAt DESC')
      .all()
      .map((row) => this.map(row))
      .filter((post) => !publicOnly || recordIsPublic(post.fields));
  }
  async save(input: Record<string, ManagedValue>, id?: string, version?: string) {
    const fields = validateManagedFields('blog', input);
    const slug = String(fields.slug);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const row = id ? this.db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id) : undefined;
      if (id && !row) throw createError({ statusCode: 404, statusMessage: 'Post not found' });
      if (row && row.version !== version)
        throw createError({ statusCode: 409, statusMessage: 'Post changed; reload before saving' });
      if (row && row.slug !== slug)
        throw createError({
          statusCode: 400,
          statusMessage: 'The slug cannot change after creation',
        });
      const duplicate = this.db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug);
      if (duplicate && duplicate.id !== id)
        throw createError({ statusCode: 409, statusMessage: 'Slug already exists' });
      const now = new Date().toISOString();
      const columns = ['id', 'version', 'createdAt', 'updatedAt', ...this.keys];
      this.db
        .prepare(
          `INSERT OR REPLACE INTO blog_posts (${columns.map((key) => `"${key}"`).join(',')}) VALUES (${columns.map(() => '?').join(',')})`,
        )
        .run(
          id || randomUUID(),
          randomUUID(),
          String(row?.createdAt || now),
          now,
          ...this.keys.map((key) =>
            typeof fields[key] === 'boolean' ? Number(fields[key]) : String(fields[key]),
          ),
        );
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
    return (await this.get(slug))!;
  }
  async remove(id: string, version: string) {
    const result = this.db
      .prepare('DELETE FROM blog_posts WHERE id = ? AND version = ?')
      .run(id, version);
    if (!result.changes)
      throw createError({
        statusCode: 409,
        statusMessage: 'Post missing or changed; reload before deleting',
      });
  }
  close() {
    this.db.close();
  }
}
let instance: BlogStore | undefined;
export function blogStore() {
  return (instance ??= new BlogStore(
    process.env.NUXT_MANAGEMENT_DATABASE || '.data/management.sqlite',
  ));
}
export function blogMutation<T>(operation: () => Promise<T>): Promise<T> {
  return operation();
}
