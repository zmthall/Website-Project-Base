<script setup lang="ts">
import { demoSection, lorem } from '../../data/demo';
const route = useRoute();
const summary = computed(() => demoSection.articles?.find((a) => a.slug === route.params.slug));
if (!summary.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' });
const article = computed(() => ({
  ...summary.value!,
  content: `${lorem}\n\n${lorem}\n\n${lorem}`,
}));
useStructuredData(() => [{ kind: 'article', article: article.value, path: route.path }]);
useSEO(() => ({
  title: article.value.title,
  description: article.value.excerpt,
  image: article.value.image,
  article: { publishedAt: article.value.publishedAt },
}));
const site = useSiteConfig();
</script>
<template>
  <article class="container section stack" style="max-width: 55rem">
    <ArticleHeader :article="article" />
    <ArticleContent :content="article.content" />
    <ArticleShare :url="`${site.url}/articles/${article.slug}`" :title="article.title" />
  </article>
</template>
