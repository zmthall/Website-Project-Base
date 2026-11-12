<script setup lang="ts">
const { newsletter, illustrative } = await useNewsletterContent();
const enabled = useFeature('newsletter');
</script>
<template>
  <section
    v-if="enabled && newsletter.homepagePreview && newsletter.stories.length"
    class="newsletter-preview section"
    aria-labelledby="newsletter-preview-heading"
  >
    <div class="container newsletter-layout">
      <header class="stack">
        <ContentEyebrow>The newsletter · {{ newsletter.issue }}</ContentEyebrow>
        <h2 id="newsletter-preview-heading">{{ newsletter.title }}</h2>
        <p class="muted">
          Ideas, updates, and a closer look at what we do. Take a moment to catch up.
        </p>
        <NuxtLink to="/newsletter" class="newsletter-link">
          Explore this issue
          <span aria-hidden="true">→</span>
        </NuxtLink>
        <small v-if="illustrative" class="muted">Sample issue · Illustrative content</small>
      </header>
      <BaseCarousel :items="newsletter.stories" label="Inside the latest newsletter">
        <template #default="{ index }">
          <article v-if="newsletter.stories[index]" class="newsletter-story stack">
            <div class="newsletter-story-meta">
              <span>{{ newsletter.stories[index]!.category }}</span>
              <span aria-hidden="true">0{{ index + 1 }}</span>
            </div>
            <h3>{{ newsletter.stories[index]!.title }}</h3>
            <p>{{ newsletter.stories[index]!.summary }}</p>
            <NuxtLink
              :to="`/newsletter#${newsletter.stories[index]!.id}`"
              class="newsletter-link"
              :aria-label="`Read ${newsletter.stories[index]!.title}`"
            >
              Read the story
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </article>
        </template>
      </BaseCarousel>
    </div>
  </section>
</template>
<style scoped>
.newsletter-preview {
  border-block: 1px solid var(--line);
  background: var(--panel);
}
.newsletter-layout {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
}
.newsletter-story {
  background: var(--page);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(1.25rem, 3vw, 2.5rem);
  min-height: 20rem;
  justify-content: center;
}
.newsletter-story h3 {
  font-size: clamp(1.6rem, 3vw, 2.5rem);
}
.newsletter-story-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--muted);
  font-size: 0.85rem;
}
.newsletter-link {
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.3em;
}
@media (max-width: 700px) {
  .newsletter-layout {
    grid-template-columns: 1fr;
  }
}
</style>
