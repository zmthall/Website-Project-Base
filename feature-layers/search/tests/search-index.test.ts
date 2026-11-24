import test from 'node:test';
import assert from 'node:assert/strict';
import { createSearchDocuments } from '../server/utils/search-index';

const record = (
  id: string,
  fields: Record<string, string | number | boolean>,
  updatedAt = '2026-01-01T00:00:00.000Z',
) => ({
  id,
  version: `version-${id}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt,
  fields,
});

test('the local index contains only public website documents in the correct scopes', () => {
  const documents = createSearchDocuments({
    now: new Date('2026-06-01T00:00:00.000Z'),
    pages: [
      { id: 'about', title: 'About us', description: 'Our story', path: '/about' },
      {
        id: 'private',
        title: 'Customer account',
        description: 'Private account',
        path: '/customer',
        public: false,
      },
    ],
    articles: [
      {
        id: 'article',
        title: 'Helpful article',
        description: 'Public advice',
        path: '/articles/helpful',
      },
    ],
    news: [
      {
        id: 'update',
        title: 'Website update',
        description: 'A public news item',
        path: '/newsletter#update',
      },
    ],
    blogPosts: [
      record('published-post', {
        title: 'Published post',
        summary: 'Visible blog summary',
        slug: 'published-post',
        status: 'published',
        publishedAt: '2026-05-01T00:00:00.000Z',
      }),
      record('draft-post', {
        title: 'Draft post',
        summary: 'Must stay private',
        slug: 'draft-post',
        status: 'draft',
        publishedAt: '2026-05-01T00:00:00.000Z',
      }),
    ],
    newsletters: [
      record('news', {
        title: 'June news',
        summary: 'Published newsletter',
        status: 'published',
        publishedAt: '2026-05-15T00:00:00.000Z',
      }),
    ],
    events: [
      record('event', {
        title: 'Community day',
        description: 'A public gathering',
        status: 'published',
        date: '2026-06-20',
        category: 'community',
      }),
      record('draft-event', {
        title: 'Secret event',
        description: 'Not public',
        status: 'draft',
        date: '2026-06-21',
      }),
    ],
  });

  assert.deepEqual(
    documents.map(({ id, scope, path }) => ({ id, scope, path })),
    [
      { id: 'page:about', scope: 'page', path: '/about' },
      { id: 'article:article', scope: 'content', path: '/articles/helpful' },
      { id: 'news:update', scope: 'content', path: '/newsletter#update' },
      { id: 'blog:published-post', scope: 'content', path: '/blog/published-post' },
      { id: 'newsletter:news', scope: 'content', path: '/newsletter#news' },
      { id: 'event:event', scope: 'event', path: '/events#event' },
    ],
  );
});
