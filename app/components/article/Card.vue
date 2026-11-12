<script setup lang="ts">
import type { ArticleSummary } from '../../../shared/types/article';
defineProps<{ article: ArticleSummary }>();
</script>
<template>
  <BaseCard as="article">
    <MediaAppImage v-if="article.image" :image="article.image" class="media-frame" />
    <ArticleMeta :article="article" />
    <h3>
      <NuxtLink :to="`/articles/${encodeURIComponent(article.slug)}`">{{ article.title }}</NuxtLink>
    </h3>
    <p class="muted">{{ article.excerpt }}</p>
    <ArticleTags :tags="article.tags" />
  </BaseCard>
</template>
