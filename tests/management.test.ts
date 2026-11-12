import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { BlogStore } from '../server/utils/blog-store';
import { ManagementStore } from '../server/utils/management-store';
import { recordIsPublic, validateManagedFields } from '../server/utils/management-validation';
import { renderMarkdown } from '../server/utils/markdown';
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
