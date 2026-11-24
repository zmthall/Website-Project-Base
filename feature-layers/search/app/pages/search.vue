<script setup lang="ts">
import { parseSearchInput } from '../features/search/utils';
import { useSearch } from '../features/search/useSearch';
import type { SearchDocument } from '../features/search/types';

useSEO({
  title: 'Search',
  description: 'Search public pages, articles, news, and events on this website.',
  robots: { index: false, follow: true },
});

const route = useRoute();
const { $features } = useNuxtApp();
const input = ref(typeof route.query.q === 'string' ? route.query.q : '');
const search = useSearch((query, signal) => $features.search.search(query, signal));
const parsed = computed(() => parseSearchInput(input.value));
const scopeNames = { all: 'all', page: 'page', content: 'content', event: 'event' } as const;
const totalPages = computed(() =>
  search.data.value ? Math.ceil(search.data.value.total / search.data.value.pageSize) : 0,
);

watch(
  () => route.query.q,
  (value) => {
    const routeQuery = typeof value === 'string' ? value : '';
    if (routeQuery !== input.value) input.value = routeQuery;
  },
);

function update(page = 1) {
  void search.update({ q: input.value, page });
}

function typeLabel(result: SearchDocument) {
  return result.type === 'blog'
    ? 'Blog post'
    : result.type === 'newsletter'
      ? 'News'
      : result.type === 'event'
        ? 'Event'
        : result.type === 'article'
          ? 'Article'
          : 'Page';
}

function changePage(page: number) {
  update(page);
}
</script>

<template>
  <main class="container section stack search-page">
    <header class="stack">
      <ContentEyebrow>Find what you need</ContentEyebrow>
      <h1>Search the website</h1>
      <p class="muted">Search everything, or begin with an indicator to narrow the results.</p>
    </header>

    <form role="search" class="stack" @submit.prevent="update()">
      <label class="field" for="site-search">
        <span class="label">Search the website</span>
        <input
          id="site-search"
          v-model="input"
          class="input"
          type="search"
          name="q"
          maxlength="200"
          autocomplete="off"
          placeholder="Try @services, #news, or *workshop"
          @input="update()"
        />
      </label>
      <div class="cluster" aria-label="Search indicators">
        <span class="badge">
          <strong>@</strong>
          pages
        </span>
        <span class="badge">
          <strong>#</strong>
          blogs &amp; news
        </span>
        <span class="badge">
          <strong>*</strong>
          events
        </span>
        <span class="help">No indicator searches everything.</span>
      </div>
    </form>

    <p v-if="parsed.q.length < 2" role="status" class="muted">
      Enter at least two letters after an optional indicator.
    </p>
    <p v-else-if="search.status.value === 'loading'" role="status" class="muted">
      Searching {{ scopeNames[parsed.scope] }} content…
    </p>
    <BaseAlert
      v-else-if="search.error.value"
      tone="danger"
      title="Search is temporarily unavailable"
    >
      Please try again.
    </BaseAlert>
    <template v-else-if="search.data.value">
      <p role="status" class="muted">
        {{ search.data.value.total }} {{ scopeNames[parsed.scope] }} results for “{{ parsed.q }}”
      </p>
      <div v-if="search.data.value.items.length" class="grid grid-2">
        <BaseCard v-for="result in search.data.value.items" :key="result.id" as="article">
          <div class="cluster">
            <span class="badge">{{ typeLabel(result) }}</span>
            <span v-if="result.category" class="help">{{ result.category }}</span>
          </div>
          <h2>
            <NuxtLink :to="result.path">{{ result.title }}</NuxtLink>
          </h2>
          <p>{{ result.description }}</p>
          <time v-if="result.publishedAt" class="help" :datetime="result.publishedAt">
            {{ result.publishedAt.slice(0, 10) }}
          </time>
        </BaseCard>
      </div>
      <BaseEmptyState
        v-else
        title="No matching results"
        description="Try different words or remove the search indicator."
      />
      <NavigationPagination
        :page="search.data.value.page"
        :total-pages="totalPages"
        @update:page="changePage"
      />
    </template>
  </main>
</template>

<style scoped>
.search-page {
  max-width: 68rem;
}
.search-page form {
  max-width: 48rem;
}
.search-page h2 {
  font-size: 1.35rem;
}
</style>
