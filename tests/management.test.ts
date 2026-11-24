import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { BlogStore } from '../feature-layers/blog/server/utils/blog-store';
import { ManagementStore } from '../server/utils/management-store';
import { recordIsPublic, validateManagedFields } from '../server/utils/management-validation';
import { renderMarkdown } from '../server/utils/markdown';

test('management persistence exposes a PostgreSQL content repository factory', async () => {
  const stores = await import('../server/utils/management-store');
  assert.equal(typeof stores.createManagedContentRepository, 'function');
});

test('PostgreSQL content repositories isolate and map their feature records', async () => {
  const { createManagedContentRepository } = await import('../server/utils/management-store');
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const execute = async (sql: string, values?: unknown[]) => {
    calls.push({ sql, values });
    return {
      rows: [
        {
          id: 'event-1',
          version: 'version-1',
          created_at: new Date('2026-01-01T00:00:00Z'),
          updated_at: new Date('2026-01-02T00:00:00Z'),
          fields: { title: 'Opening day', status: 'published' },
        },
      ],
    };
  };
  const repository = createManagedContentRepository('events', {
    query: execute,
    async transaction<T>(operation: (query: typeof execute) => Promise<T>) {
      return operation(execute);
    },
  });

  assert.deepEqual(await repository.list(), [
    {
      id: 'event-1',
      version: 'version-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      fields: { title: 'Opening day', status: 'published' },
    },
  ]);
  assert.deepEqual(calls[0]?.values, ['events']);
});

test('PostgreSQL content repositories create versioned feature records', async () => {
  const { createManagedContentRepository } = await import('../server/utils/management-store');
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const execute = async (sql: string, values?: unknown[]) => {
    calls.push({ sql, values });
    return {
      rows: [
        {
          id: 'review-1',
          version: 'version-1',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
          fields: values?.[3],
        },
      ],
    };
  };
  const repository = createManagedContentRepository('reviews', {
    query: execute,
    async transaction<T>(operation: (query: typeof execute) => Promise<T>) {
      return operation(execute);
    },
  });

  const record = await repository.save({ name: 'Jane', rating: 5, status: 'pending' });

  assert.equal(record.id, 'review-1');
  assert.deepEqual(record.fields, { name: 'Jane', rating: 5, status: 'pending' });
  assert.match(calls[0]!.sql, /INSERT INTO managed_content/);
  assert.equal(calls[0]!.values?.[0], 'reviews');
});

test('PostgreSQL content repositories reject stale feature edits', async () => {
  const { createManagedContentRepository } = await import('../server/utils/management-store');
  const execute = async () => ({ rows: [] });
  const repository = createManagedContentRepository('events', {
    query: execute,
    async transaction<T>(operation: (query: typeof execute) => Promise<T>) {
      return operation(execute);
    },
  });

  await assert.rejects(
    repository.save({ title: 'Changed' }, 'event-1', 'stale-version'),
    (error: unknown) => (error as { statusCode?: number }).statusCode === 409,
  );
});

test('PostgreSQL content repositories scope reads and deletes by feature and version', async () => {
  const { createManagedContentRepository } = await import('../server/utils/management-store');
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const execute = async (sql: string, values?: unknown[]) => {
    calls.push({ sql, values });
    return sql.includes('SELECT')
      ? {
          rows: [
            {
              id: 'event-1',
              version: 'version-1',
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
              fields: { title: 'Opening day' },
            },
          ],
        }
      : { rows: [{}] };
  };
  const repository = createManagedContentRepository('events', {
    query: execute,
    async transaction<T>(operation: (query: typeof execute) => Promise<T>) {
      return operation(execute);
    },
  });

  assert.equal((await repository.get('event-1'))?.id, 'event-1');
  await repository.remove('event-1', 'version-1');
  assert.deepEqual(calls[0]?.values, ['events', 'event-1']);
  assert.deepEqual(calls[1]?.values, ['events', 'event-1', 'version-1']);
});

test('management routing selects repositories owned by editorial feature layers', async () => {
  const { managedRepository } = await import('../server/utils/management-api');
  const { eventRepository } = await import(
    '../feature-layers/events/server/repositories/events'
  );
  const { reviewRepository } = await import(
    '../feature-layers/reviews/server/repositories/reviews'
  );

  assert.equal(managedRepository('events'), eventRepository);
  assert.equal(managedRepository('reviews'), reviewRepository);
});

test('management routing selects PostgreSQL repositories for shared site content', async () => {
  const { managedRepository } = await import('../server/utils/management-api');
  const repositories = await import('../server/repositories/shared-content');

  assert.equal(managedRepository('business'), repositories.businessRepository);
  assert.equal(managedRepository('faqs'), repositories.faqRepository);
  assert.equal(managedRepository('media'), repositories.mediaRepository);
  assert.equal(managedRepository('ratings'), repositories.ratingRepository);
});

test('public content API includes the shared database resources', async () => {
  const { publicContentKinds } = await import('../server/utils/management-api');
  assert.deepEqual(
    ['business', 'faqs', 'media', 'ratings'].filter((kind) =>
      publicContentKinds.includes(kind as never),
    ),
    ['business', 'faqs', 'media', 'ratings'],
  );
});

test('shared content number fields use their declared ranges and precision', () => {
  const faq = validateManagedFields('faqs', {
    question: 'When are you open?',
    answer: 'Weekdays.',
    categoryId: 'general',
    order: 25,
    status: 'published',
  });
  const rating = validateManagedFields('ratings', {
    name: 'Customer rating',
    value: 4.8,
    ratingCount: 125,
    reviewCount: 80,
    status: 'published',
  });

  assert.equal(faq.order, 25);
  assert.equal(rating.value, 4.8);
  assert.throws(() =>
    validateManagedFields('ratings', {
      name: 'Invalid rating',
      value: 5.1,
      ratingCount: 0,
      reviewCount: 0,
      status: 'published',
    }),
  );
});

test('business JSON must contain an object when supplied', () => {
  const fields = validateManagedFields('business', {
    name: 'Example Business',
    legalName: '',
    phone: '',
    email: 'hello@example.com',
    document: '{"locations":[]}',
    status: 'published',
  });

  assert.equal(fields.document, '{"locations":[]}');
  assert.throws(() =>
    validateManagedFields('business', {
      name: 'Example Business',
      legalName: '',
      phone: '',
      email: 'hello@example.com',
      document: 'not json',
      status: 'published',
    }),
  );
});

test('blog runtime renders and persists posts through its PostgreSQL repository', async () => {
  const { PostgresBlogStore } = await import(
    '../feature-layers/blog/server/utils/blog-store'
  );
  const records: Array<{
    id: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    fields: Record<string, string | number | boolean>;
  }> = [];
  const repository = {
    async list() {
      return structuredClone(records);
    },
    async get(id: string) {
      return structuredClone(records.find((record) => record.id === id));
    },
    async save(fields: Record<string, string | number | boolean>, id?: string) {
      const previous = records.find((record) => record.id === id);
      const record = {
        id: id ?? 'post-1',
        version: previous ? 'version-2' : 'version-1',
        createdAt: previous?.createdAt ?? '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
        fields: structuredClone(fields),
      };
      if (previous) records.splice(records.indexOf(previous), 1, record);
      else records.push(record);
      return structuredClone(record);
    },
    async remove(id: string) {
      records.splice(records.findIndex((record) => record.id === id), 1);
    },
  };
  const store = new PostgresBlogStore(repository);
  const fields = {
    title: 'Database post',
    slug: 'database-post',
    summary: 'Summary',
    author: 'Team',
    content: '## PostgreSQL\n\n**Stored centrally.**',
    seoTitle: '',
    seoDescription: '',
    thumbnail: '',
    seoImage: '',
    canonicalUrl: '',
    noIndex: false,
    status: 'published',
    publishedAt: '2026-01-01T00:00:00.000Z',
  };

  const post = await store.save(fields);
  assert.equal(post.slug, 'database-post');
  assert.match(post.html, /<strong>Stored centrally/);
  assert.equal((await store.list(true)).length, 1);
  assert.equal((await store.get('database-post'))?.id, 'post-1');
});

test('blog database persists separate Markdown and SEO columns and guards stale edits', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'blog-test-'));
  const file = join(dir, 'cms.sqlite');
  const store = new BlogStore(file);
  try {
    const fields = {
      title: 'Example',
      slug: 'example',
      summary: 'Summary',
      author: 'Team',
      content: '## Heading\n\n**Markdown**',
      seoTitle: 'Search title',
      seoDescription: 'Search description',
      status: 'draft',
    };
    const post = await store.save(fields);
    assert.equal((await store.list(true)).length, 0);
    const db = new DatabaseSync(file);
    const row = db.prepare('SELECT content,seoTitle,title FROM blog_posts').get();
    assert.equal(row?.content, fields.content);
    assert.equal(row?.seoTitle, 'Search title');
    db.close();
    await assert.rejects(store.save(fields), /Slug already exists/);
    const live = await store.save(
      { ...fields, status: 'published', publishedAt: '2020-01-01T00:00:00Z' },
      post.id,
      post.version,
    );
    assert.equal((await store.list(true)).length, 1);
    assert.match(live.html, /<strong>Markdown/);
    await assert.rejects(store.save(fields, post.id, post.version), /Post changed/);
    const scheduled = await store.save(
      { ...live.fields, publishedAt: '2099-01-01T00:00:00Z' },
      live.id,
      live.version,
    );
    assert.equal((await store.list(true)).length, 0);
    await assert.rejects(store.remove(live.id, live.version));
    await store.remove(scheduled.id, scheduled.version);
    assert.equal(await store.get('example'), undefined);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test('submissions and auth policy survive database reopen', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cms-test-'));
  const path = join(dir, 'cms.sqlite');
  let store = new ManagementStore(path);
  try {
    const review = store.save(
      'reviews',
      validateManagedFields('reviews', {
        name: 'Jane',
        rating: 5,
        content: 'Great',
        status: 'pending',
      }),
    );
    assert.equal(review.fields.status, 'pending');
    store.savePolicy('customer', { sessionDurationMinutes: 120, idleTimeoutMinutes: 10 });
    store.close();
    store = new ManagementStore(path);
    assert.equal(store.list('reviews').length, 1);
    assert.equal(store.policy('customer').idleTimeoutMinutes, 10);
    assert.throws(() => store.remove('reviews', review.id, 'stale'));
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test('Markdown escapes raw HTML and blocks unsafe link schemes', () => {
  const result = renderMarkdown(
    '## Hello\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))',
  );
  assert.ok(!result.html.includes('<script>'));
  assert.ok(!result.html.includes('href="javascript:'));
  assert.equal(result.toc[0]?.id, 'hello');
  assert.equal(recordIsPublic({ status: 'draft', publishedAt: '2020-01-01' }), false);
});
