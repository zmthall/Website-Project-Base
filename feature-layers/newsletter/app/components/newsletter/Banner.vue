<script setup lang="ts">
const { newsletter } = await useNewsletterContent();
const enabled = useFeature('newsletter');
const dismissed = useState('newsletter-banner-dismissed', () => false);
</script>
<template>
  <aside
    v-if="enabled && newsletter.topBanner && newsletter.stories.length && !dismissed"
    class="newsletter-banner"
    aria-label="Latest newsletter"
  >
    <div class="container newsletter-banner-inner">
      <NuxtLink to="/newsletter">
        {{ newsletter.bannerText }}
        <span aria-hidden="true">→</span>
      </NuxtLink>
      <button type="button" aria-label="Dismiss newsletter announcement" @click="dismissed = true">
        ×
      </button>
    </div>
  </aside>
</template>
<style scoped>
.newsletter-banner {
  background: var(--brand-primary);
  color: var(--on-primary);
}
.newsletter-banner-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-block: 0.4rem;
}
a {
  color: inherit;
  font-size: 0.875rem;
  text-align: center;
  text-underline-offset: 0.2em;
}
button {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  font-size: 1.5rem;
  color: inherit;
  cursor: pointer;
}
</style>
