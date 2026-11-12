<script setup lang="ts">
import type { ArticleTag } from '../../../shared/types/article';
defineProps<{ tags?: ArticleTag[] }>();
</script>
<template>
  <ul v-if="tags?.length" class="cluster" aria-label="Article tags">
    <li v-for="tag in tags" :key="tag.id">
      <NuxtLink v-if="tag.slug" class="badge" :to="`/articles?tag=${encodeURIComponent(tag.slug)}`">
        {{ tag.name }}
      </NuxtLink>
      <BaseBadge v-else>{{ tag.name }}</BaseBadge>
    </li>
  </ul>
</template>
