// TODO [SEARCH-01]: Add rate limits before exposing this endpoint to sustained untrusted traffic at production scale. See docs/integration-audit.md.
import { site } from '../../../../shared/data/site';
import { searchDocuments } from '../../app/features/search/utils';
import type { SearchQuery, SearchScope } from '../../app/features/search/types';
import { localSearchDocuments } from '../utils/search-source';

const scopes = new Set<SearchScope>(['all', 'page', 'content', 'event']);

export default defineEventHandler(async (event) => {
  if (!site.features.search) throw createError({ statusCode: 404 });
  const query = getQuery(event);
  const scope = String(query.scope || '');
  const searchQuery: SearchQuery = {
    q: String(query.q || ''),
    scope: scopes.has(scope as SearchScope) ? (scope as SearchScope) : undefined,
    type: String(query.type || '') || undefined,
    category: String(query.category || '') || undefined,
    sort: query.sort === 'newest' ? 'newest' : 'relevance',
    page: Math.max(1, Number(query.page) || 1),
    pageSize: Math.min(50, Math.max(1, Number(query.pageSize) || 10)),
  };
  return searchDocuments(await localSearchDocuments(), searchQuery);
});
