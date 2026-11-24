import { watch, onScopeDispose } from 'vue';
import { useRoute, useRouter } from '#app';
import { useFeatureRequest } from '../../../../_shared/useFeatureRequest';
import { normalizeQuery } from './utils';
import type { SearchQuery, SearchResult } from './types';
/** Route query is the source of truth; debounce and abort prevent stale search results. */
export function useSearch(
  search: (query: SearchQuery, signal: AbortSignal) => Promise<SearchResult>,
) {
  const route = useRoute();
  const router = useRouter();
  const request = useFeatureRequest(search);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const text = (value: unknown) => (typeof value === 'string' ? value : '');
  watch(
    () => route.query,
    () => {
      clearTimeout(timer);
      request.reset();
      const q = normalizeQuery(text(route.query.q));
      if (q.length < 2 || import.meta.server) return;
      timer = setTimeout(
        () =>
          void request.execute({
            q,
            type: text(route.query.type) || undefined,
            category: text(route.query.category) || undefined,
            page: Math.max(1, Number(route.query.page) || 1),
            sort: route.query.sort === 'newest' ? 'newest' : 'relevance',
          }),
        250,
      );
    },
    { immediate: true },
  );
  onScopeDispose(() => clearTimeout(timer));
  return {
    ...request,
    update: (query: SearchQuery) =>
      router.replace({
        query: {
          ...route.query,
          q: normalizeQuery(query.q) || undefined,
          type: query.type,
          category: query.category,
          sort: query.sort,
          page: query.page && query.page > 1 ? String(query.page) : undefined,
        },
      }),
  };
}
