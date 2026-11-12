<script setup lang="ts">
import type { BlogPost } from '#shared/types/management';
useSEO({ title: 'Blog', description: 'News, ideas, and stories from our team.' });
const page = ref(1);
const search = ref('');
const { data, error } = await useFetch<{ items: BlogPost[]; total: number; pageSize: number }>(
  '/api/blog',
  { query: { page, search } },
);
watch(search, () => {
  page.value = 1;
});
</script>
<template>
  <div class="container section stack">
    <header class="stack">
      <ContentEyebrow>From our team</ContentEyebrow>
      <h1>Stories and ideas.</h1>
    </header>
    <label class="stack">
      Search posts
      <input v-model="search" type="search" class="admin-input" />
    </label>
    <p v-if="error" role="alert">Posts could not be loaded. Please try again.</p>
    <div v-else-if="data?.items.length" class="grid grid-3">
      <article v-for="post in data.items" :key="post.id" class="admin-card stack">
        <img
          v-if="post.fields.thumbnail"
          :src="String(post.fields.thumbnail)"
          :alt="String(post.fields.thumbnailAlt || '')"
          loading="lazy"
          style="width: 100%; aspect-ratio: 16/9; object-fit: cover"
        />
        <ContentEyebrow v-if="post.fields.featured">Featured</ContentEyebrow>
        <h2>
          <NuxtLink :to="`/blog/${post.slug}`">{{ post.fields.title }}</NuxtLink>
        </h2>
        <p>{{ post.fields.summary }}</p>
        <small>{{ post.fields.author }} · {{ post.readingMinutes }} min read</small>
      </article>
    </div>
    <p v-else>No published posts yet.</p>
    <nav v-if="data && data.total > data.pageSize" class="cluster" aria-label="Blog pagination">
      <BaseButton :disabled="page === 1" @click="page--">Previous</BaseButton>
      <span>Page {{ page }}</span>
      <BaseButton :disabled="page * data.pageSize >= data.total" @click="page++">Next</BaseButton>
    </nav>
  </div>
</template>
