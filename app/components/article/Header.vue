<script setup lang="ts">
import type { Article } from '../../../shared/types/article';
withDefaults(defineProps<{ article: Article; headingLevel?: 1 | 2 | 3 }>(), { headingLevel: 1 });
</script>
<template>
  <header class="stack">
    <ContentEyebrow v-if="article.categories?.[0]">{{ article.categories[0].name }}</ContentEyebrow>
    <component :is="`h${headingLevel}`">{{ article.title }}</component>
    <p class="muted">{{ article.excerpt }}</p>
    <ArticleMeta :article="article" :modified-at="article.modifiedAt" />
    <MediaAppImage
      v-if="article.image"
      :image="{ ...article.image, loading: 'eager', fetchPriority: 'high' }"
    />
  </header>
</template>
