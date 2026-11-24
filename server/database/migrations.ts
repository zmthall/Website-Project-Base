export interface DatabaseMigration {
  id: string;
  sql: string;
}

export const databaseMigrations: readonly DatabaseMigration[] = [
  {
    id: '0001_database_foundation',
    sql: `
      CREATE TABLE IF NOT EXISTS app_runtime_metadata (
        key text PRIMARY KEY,
        value jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `,
  },
  {
    id: '0002_managed_content',
    sql: `
      CREATE TABLE IF NOT EXISTS managed_content (
        kind text NOT NULL,
        id text NOT NULL,
        version text NOT NULL,
        fields jsonb NOT NULL CHECK (jsonb_typeof(fields) = 'object'),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (kind, id)
      );
      CREATE INDEX IF NOT EXISTS managed_content_kind_updated
        ON managed_content (kind, updated_at DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS managed_content_blog_slug
        ON managed_content ((fields ->> 'slug'))
        WHERE kind = 'blog';
    `,
  },
];
