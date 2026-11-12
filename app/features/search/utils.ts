import type { SearchDocument, SearchQuery, SearchResult } from './types';
export const normalizeQuery = (query: string) =>
  query.normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 200);
export function searchDocuments(documents: SearchDocument[], query: SearchQuery): SearchResult {
  const term = normalizeQuery(query.q).toLowerCase();
  const pageSize = Math.min(50, Math.max(1, Math.trunc(query.pageSize || 10)));
  const page = Math.max(1, Math.trunc(query.page || 1));
  const words = term.split(' ');
  const items =
    term.length < 2
      ? []
      : documents
          .filter(
            (item) =>
              item.path.startsWith('/') &&
              !item.path.startsWith('//') &&
              (!query.type || item.type === query.type) &&
              (!query.category || item.category === query.category) &&
              words.every((word) =>
                `${item.title} ${item.description}`.toLowerCase().includes(word),
              ),
          )
          .map((item) => ({
            item,
            score: words.filter((word) => item.title.toLowerCase().includes(word)).length,
          }));
  items.sort((a, b) =>
    query.sort === 'newest'
      ? (Date.parse(b.item.publishedAt ?? '') || 0) - (Date.parse(a.item.publishedAt ?? '') || 0)
      : b.score - a.score || a.item.title.localeCompare(b.item.title),
  );
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize).map((result) => result.item),
    total: items.length,
    page,
    pageSize,
  };
}
