// TODO [SEARCH-01]: Add shared abuse controls and a server-only provider adapter if the local request-time index is replaced at production scale. See docs/integration-audit.md.
import type { ApiClient } from '../../../../../app/api/types';
import { featureClient } from '../../../../_shared/transport';
import { normalizeQuery } from './utils';
import type { SearchQuery, SearchResult } from './types';
export function createSearchApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    search: (query: SearchQuery, signal?: AbortSignal) =>
      api<SearchResult>('/search', { query: { ...query, q: normalizeQuery(query.q) }, signal }),
  };
}
