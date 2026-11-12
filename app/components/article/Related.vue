<script setup lang="ts">
import type { ArticleSummary } from '../../../shared/types/article';
withDefaults(
  defineProps<{
    articles: ArticleSummary[];
    heading?: string;
    limit?: number;
    showEmpty?: boolean;
  }>(),
  { heading: 'Related articles', limit: 3 },
);
</script>
<template>
  <section v-if="articles.length || showEmpty" class="stack">
    <h2>{{ heading }}</h2>
    <div v-if="articles.length" class="grid grid-3">
      <ArticleCard
        v-for="article in articles.slice(0, limit)"
        :key="article.id"
        :article="article"
      />
    </div>
    <BaseEmptyState v-else title="No related articles" />
  </section>
</template>
