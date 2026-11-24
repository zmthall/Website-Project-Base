import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resources } from '../../shared/data/management';
import { business } from '../../shared/data/business';
import { faqs } from '../../shared/data/faq';
import type { ManagedValue, ResourceKind } from '../../shared/types/management';
import type { Business } from '../../shared/types/business';
import { databaseTransaction } from '../utils/integration-config';

type LegacyRecordRow = { kind?: unknown; data?: unknown };
type LegacyBlogRow = Record<string, unknown>;
type ImportRecord = {
  kind: ResourceKind;
  id: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  fields: Record<string, ManagedValue>;
};

const publicLegacyKinds = new Set<ResourceKind>(['events', 'reviews']);
const configuredBusiness: Business = business;

function parsedRecord(row: LegacyRecordRow): ImportRecord | undefined {
  if (!publicLegacyKinds.has(row.kind as ResourceKind) || typeof row.data !== 'string') return;
  try {
    const record = JSON.parse(row.data) as Partial<ImportRecord>;
    if (
      !record.id ||
      !record.version ||
      !record.createdAt ||
      !record.updatedAt ||
      !record.fields ||
      typeof record.fields !== 'object'
    )
      return;
    return { ...record, kind: row.kind as ResourceKind } as ImportRecord;
  } catch {
    return;
  }
}

function blogRecord(row: LegacyBlogRow): ImportRecord | undefined {
  if (!row.id || !row.version || !row.createdAt || !row.updatedAt) return;
  const fields = Object.fromEntries(
    resources.blog.fields.map((field) => [
      field.key,
      field.type === 'checkbox' ? Boolean(row[field.key]) : String(row[field.key] ?? ''),
    ]),
  ) as Record<string, ManagedValue>;
  return {
    kind: 'blog',
    id: String(row.id),
    version: String(row.version),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    fields,
  };
}

/** Converts only public/editorial SQLite rows. Private messages and applications are excluded. */
export function prepareLegacyContent(
  records: LegacyRecordRow[],
  blogPosts: LegacyBlogRow[],
): ImportRecord[] {
  return [
    ...records.map(parsedRecord),
    ...blogPosts.map(blogRecord),
  ].filter((record): record is ImportRecord => Boolean(record));
}

function legacyRows(filename: string) {
  if (!existsSync(filename)) return [];
  const database = new DatabaseSync(filename, { readOnly: true });
  try {
    const tables = new Set(
      database
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((row) => String(row.name)),
    );
    const records = tables.has('records')
      ? (database.prepare('SELECT kind, data FROM records').all() as LegacyRecordRow[])
      : [];
    const posts = tables.has('blog_posts')
      ? (database.prepare('SELECT * FROM blog_posts').all() as LegacyBlogRow[])
      : [];
    return prepareLegacyContent(records, posts);
  } finally {
    database.close();
  }
}

function bootstrapRecords(now: string): ImportRecord[] {
  const businessRecord: ImportRecord = {
    kind: 'business',
    id: 'primary-business',
    version: 'bootstrap-v1',
    createdAt: now,
    updatedAt: now,
    fields: {
      name: configuredBusiness.name,
      legalName: configuredBusiness.legalName ?? '',
      phone: configuredBusiness.contact?.phone ?? '',
      email: configuredBusiness.contact?.email ?? '',
      document: JSON.stringify(configuredBusiness, null, 2),
      status: 'published',
    },
  };
  const faqRecords = faqs.map<ImportRecord>((faq) => ({
    kind: 'faqs',
    id: faq.id,
    version: 'bootstrap-v1',
    createdAt: now,
    updatedAt: now,
    fields: {
      question: faq.question,
      answer: faq.answer,
      categoryId: faq.categoryId ?? '',
      order: faq.order ?? '',
      status: 'published',
    },
  }));
  const ratings: ImportRecord[] = configuredBusiness.rating
    ? [
        {
          kind: 'ratings',
          id: 'business-rating',
          version: 'bootstrap-v1',
          createdAt: now,
          updatedAt: now,
          fields: {
            name: configuredBusiness.name,
            value: configuredBusiness.rating.value,
            ratingCount: configuredBusiness.rating.ratingCount ?? '',
            reviewCount: configuredBusiness.rating.reviewCount ?? '',
            status: 'published',
          },
        },
      ]
    : [];
  return [businessRecord, ...faqRecords, ...ratings];
}

/** One-time, non-destructive import plus initial shared-content bootstrap. */
export async function initializeManagedContent(
  filename = process.env.NUXT_MANAGEMENT_DATABASE || '.data/management.sqlite',
) {
  const records = [...legacyRows(filename), ...bootstrapRecords(new Date().toISOString())];
  await databaseTransaction(async (query) => {
    const marker = await query(
      "SELECT key FROM app_runtime_metadata WHERE key = 'managed-content-bootstrap-v1'",
    );
    if (marker.rows.length) return;
    for (const record of records)
      await query(
        `INSERT INTO managed_content
           (kind, id, version, fields, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (kind, id) DO NOTHING`,
        [
          record.kind,
          record.id,
          record.version,
          record.fields,
          record.createdAt,
          record.updatedAt,
        ],
      );
    await query(
      `INSERT INTO app_runtime_metadata (key, value)
       VALUES ('managed-content-bootstrap-v1', $1)
       ON CONFLICT (key) DO NOTHING`,
      [{ imported: true }],
    );
  });
}
