import type { ManagedRecord } from '../../../../shared/types/management';
import type { SearchDocument } from '../../app/features/search/types';

interface PublicSearchSource {
  id: string;
  title: string;
  description: string;
  path: string;
  category?: string;
  publishedAt?: string;
  public?: boolean;
}

export interface SearchDocumentSources {
  now?: Date;
  pages?: PublicSearchSource[];
  articles?: PublicSearchSource[];
  news?: PublicSearchSource[];
  blogPosts?: ManagedRecord[];
  newsletters?: ManagedRecord[];
  events?: ManagedRecord[];
}

function isPublished(record: ManagedRecord, now: Date): boolean {
  if (record.fields.status !== 'published') return false;
  const publishedAt = String(record.fields.publishedAt || '');
  return (
    !publishedAt || (Number.isFinite(Date.parse(publishedAt)) && Date.parse(publishedAt) <= +now)
  );
}

function sourceDocument(
  source: PublicSearchSource,
  type: SearchDocument['type'],
  scope: NonNullable<SearchDocument['scope']>,
): SearchDocument {
  return {
    id: `${type}:${source.id}`,
    title: source.title,
    description: source.description,
    path: source.path,
    type,
    scope,
    category: source.category,
    publishedAt: source.publishedAt,
  };
}

export function createSearchDocuments(sources: SearchDocumentSources): SearchDocument[] {
  const now = sources.now ?? new Date();
  const pages = (sources.pages ?? [])
    .filter((page) => page.public !== false)
    .map((page) => sourceDocument(page, 'page', 'page'));
  const articles = (sources.articles ?? [])
    .filter((article) => article.public !== false)
    .map((article) => sourceDocument(article, 'article', 'content'));
  const news = (sources.news ?? [])
    .filter((item) => item.public !== false)
    .map((item) => sourceDocument(item, 'news', 'content'));
  const blogs = (sources.blogPosts ?? [])
    .filter((post) => isPublished(post, now))
    .map((post) =>
      sourceDocument(
        {
          id: post.id,
          title: String(post.fields.title),
          description: String(post.fields.summary),
          path: `/blog/${encodeURIComponent(String(post.fields.slug))}`,
          category: String(post.fields.tags || '') || undefined,
          publishedAt: String(post.fields.publishedAt || '') || undefined,
        },
        'blog',
        'content',
      ),
    );
  const newsletters = (sources.newsletters ?? [])
    .filter((issue) => isPublished(issue, now))
    .map((issue) =>
      sourceDocument(
        {
          id: issue.id,
          title: String(issue.fields.title),
          description: String(issue.fields.summary),
          path: `/newsletter#${encodeURIComponent(issue.id)}`,
          category: String(issue.fields.issue || '') || undefined,
          publishedAt: String(issue.fields.publishedAt || '') || undefined,
        },
        'newsletter',
        'content',
      ),
    );
  const events = (sources.events ?? [])
    .filter((event) => event.fields.status === 'published')
    .map((event) =>
      sourceDocument(
        {
          id: event.id,
          title: String(event.fields.title),
          description: String(event.fields.description),
          path: `/events#${encodeURIComponent(event.id)}`,
          category: String(event.fields.category || '') || undefined,
          publishedAt: String(event.fields.date || '') || undefined,
        },
        'event',
        'event',
      ),
    );
  return [...pages, ...articles, ...news, ...blogs, ...newsletters, ...events];
}
