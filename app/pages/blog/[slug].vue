<script setup lang="ts">
import type { BlogPost } from '#shared/types/management';
const route = useRoute();
const { data: post, error } = await useFetch<BlogPost>(
  () => `/api/blog/${encodeURIComponent(String(route.params.slug))}`,
);
if (error.value || !post.value)
  throw createError({ statusCode: 404, statusMessage: 'Post not found' });
useSEO(() => ({
  title: String(post.value?.fields.seoTitle || post.value?.fields.title),
  description: String(post.value?.fields.seoDescription || post.value?.fields.summary),
  image: {
    src: String(post.value?.fields.seoImage || post.value?.fields.thumbnail || ''),
    alt: String(post.value?.fields.thumbnailAlt || ''),
  },
  canonical: String(post.value?.fields.canonicalUrl || ''),
  openGraph: { type: 'article' },
  article: {
    publishedAt: String(post.value?.fields.publishedAt),
    modifiedAt: post.value?.updatedAt,
  },
}));
const site = useSiteConfig();
const { data: otherPosts } = await useFetch<{ items: BlogPost[] }>('/api/blog', {
  query: { pageSize: 50 },
});
const related = computed(() => {
  const tags = String(post.value?.fields.tags || '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  return (otherPosts.value?.items || [])
    .filter(
      (item) =>
        item.id !== post.value?.id &&
        String(item.fields.tags)
          .split(',')
          .some((tag) => tags.includes(tag.trim().toLowerCase())),
    )
    .slice(0, 3);
});
const picks = computed(() =>
  (otherPosts.value?.items || [])
    .filter((item) => item.fields.staffPick && item.id !== post.value?.id)
    .slice(0, 3),
);
useStructuredData(() => [
  {
    kind: 'article',
    path: route.path,
    article: {
      id: post.value!.id,
      slug: post.value!.slug,
      title: String(post.value!.fields.title),
      excerpt: String(post.value!.fields.summary),
      content: String(post.value!.fields.content),
      publishedAt: String(post.value!.fields.publishedAt),
    },
  },
]);
</script>
<template>
  <article v-if="post" class="container section stack" style="max-width: 58rem">
    <NuxtLink to="/blog">All posts</NuxtLink>
    <header class="stack">
      <h1>{{ post.fields.title }}</h1>
      <p>{{ post.fields.summary }}</p>
      <p class="muted">
        {{ post.fields.author }} ·
        <time :datetime="String(post.fields.publishedAt)">
          {{ String(post.fields.publishedAt).slice(0, 10) }}
        </time>
        · {{ post.readingMinutes }} min read
      </p>
    </header>
    <img
      v-if="post.fields.thumbnail"
      :src="String(post.fields.thumbnail)"
      :alt="String(post.fields.thumbnailAlt || '')"
      style="width: 100%"
    />
    <BlogMarkdown :rendered="post" show-toc />
    <p v-if="post.fields.tags" class="muted">Tags: {{ post.fields.tags }}</p>
    <ArticleShare :url="`${site.url}/blog/${post.slug}`" :title="String(post.fields.title)" />
    <aside v-if="related.length" class="stack">
      <h2>Related posts</h2>
      <NuxtLink v-for="item in related" :key="item.id" :to="`/blog/${item.slug}`">
        {{ item.fields.title }}
      </NuxtLink>
    </aside>
    <aside v-if="picks.length" class="stack">
      <h2>Staff picks</h2>
      <NuxtLink v-for="item in picks" :key="item.id" :to="`/blog/${item.slug}`">
        {{ item.fields.title }}
      </NuxtLink>
    </aside>
  </article>
</template>
