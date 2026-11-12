<script setup lang="ts">
import type { ManagedRecord, RenderedMarkdown } from '#shared/types/management';
import { newsletter } from '#shared/data/newsletter';
useSEO({ title: 'Newsletter', description: newsletter.introduction });
const { data: issues } = await useFetch<(ManagedRecord & RenderedMarkdown)[]>(
  '/api/content/newsletters',
);
</script>
<template>
  <div class="container section stack newsletter-issue">
    <section v-if="issues?.length" class="stack">
      <article v-for="issue in issues" :id="issue.id" :key="issue.id" class="stack">
        <ContentEyebrow>{{ issue.fields.issue }}</ContentEyebrow>
        <h1>{{ issue.fields.title }}</h1>
        <BlogMarkdown :rendered="issue" show-toc />
      </article>
    </section>
    <header v-if="!issues?.length" class="stack">
      <ContentEyebrow>Newsletter · {{ newsletter.issue }}</ContentEyebrow>
      <h1>{{ newsletter.title }}</h1>
      <p class="muted">{{ newsletter.introduction }}</p>
    </header>
    <article
      v-for="story in issues?.length ? [] : newsletter.stories"
      :id="story.id"
      :key="story.id"
      class="section stack newsletter-article"
    >
      <ContentEyebrow>{{ story.category }}</ContentEyebrow>
      <h2>{{ story.title }}</h2>
      <p>
        <strong>{{ story.summary }}</strong>
      </p>
      <p>{{ story.body }}</p>
    </article>
    <NewsletterSubscribe />
  </div>
</template>
<style scoped>
.newsletter-issue {
  max-width: 54rem;
}
.newsletter-article {
  border-bottom: 1px solid var(--line);
  scroll-margin-top: 8rem;
}
</style>
