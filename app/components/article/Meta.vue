<script setup lang="ts">
import type { ArticleSummary } from '../../../shared/types/article';
defineProps<{ article: ArticleSummary; modifiedAt?: string }>();
const site = useSiteConfig();
function date(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.valueOf())
    ? value
    : new Intl.DateTimeFormat(site.locale.default, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        d,
      );
}
</script>
<template>
  <div class="cluster muted" style="font-size: 0.8rem">
    <span v-if="article.author">By {{ article.author.name }}</span>
    <time v-if="article.publishedAt" :datetime="article.publishedAt">
      {{ date(article.publishedAt) }}
    </time>
    <span v-if="modifiedAt">
      Updated
      <time :datetime="modifiedAt">{{ date(modifiedAt) }}</time>
    </span>
    <span v-if="article.readingTimeMinutes">{{ article.readingTimeMinutes }} min read</span>
    <span v-for="category in article.categories" :key="category.id">{{ category.name }}</span>
  </div>
</template>
