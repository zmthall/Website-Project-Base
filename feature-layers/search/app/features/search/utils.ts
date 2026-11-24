import type { SearchDocument, SearchQuery, SearchResult, SearchScope } from './types';
export const normalizeQuery = (query: string) =>
  query.normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 200);

const prefixScopes: Readonly<Record<string, Exclude<SearchScope, 'all'> | undefined>> = {
  '@': 'page',
  '#': 'content',
  '*': 'event',
};

export function parseSearchInput(input: string): { q: string; scope: SearchScope } {
  const normalized = normalizeQuery(input);
  const scope: SearchScope = prefixScopes[normalized[0] ?? ''] ?? 'all';
  return {
    q: scope === 'all' ? normalized : normalizeQuery(normalized.slice(1)),
    scope,
  };
}

function documentScope(document: SearchDocument): Exclude<SearchScope, 'all'> {
  if (document.scope) return document.scope;
  if (document.type === 'event') return 'event';
  if (['article', 'blog', 'newsletter', 'news'].includes(document.type)) return 'content';
  return 'page';
}

export function searchDocuments(documents: SearchDocument[], query: SearchQuery): SearchResult {
  const parsed = parseSearchInput(query.q);
  const scope = query.scope && query.scope !== 'all' ? query.scope : parsed.scope;
  const term = parsed.q.toLowerCase();
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
              (scope === 'all' || documentScope(item) === scope) &&
              (!query.type || item.type === query.type) &&
              (!query.category || item.category === query.category) &&
              words.every((word) =>
                `${item.title} ${item.description} ${item.type} ${item.type}s ${item.category ?? ''}`
                  .toLowerCase()
                  .includes(word),
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
