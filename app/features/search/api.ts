// TODO [SEARCH-01]: Create a public-only publication-aware index and invalidate it on edits/deletions; scope remote credentials and rate-limit queries without indexing account/admin/applicant records. See docs/integration-audit.md.
import type { ApiClient } from '../../api/types';
import { featureClient } from '../_shared/transport';
import { normalizeQuery } from './utils';
import type { SearchQuery, SearchResult } from './types';
export function createSearchApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    search: (query: SearchQuery, signal?: AbortSignal) =>
      api<SearchResult>('/search', { query: { ...query, q: normalizeQuery(query.q) }, signal }),
  };
}
