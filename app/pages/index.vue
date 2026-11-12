<script setup lang="ts">
import { demoSection } from '../data/demo';
import { themes } from '../theme/registry';
import { sectionRegistry } from '../theme/sections';
import type { SectionData } from '../types/sections';
const config = useWebsiteUI();
const reviewsEnabled = useFeature('reviews');
useSEO({
  title: 'A thoughtful foundation',
  description: 'A minimal business website template. All content is illustrative.',
});
const submitted = ref(false);
const sections = computed(() => {
  const theme = themes[config.value.theme] ?? themes.foundation!;
  const families = [...new Set([...theme.sectionOrder, ...Object.keys(config.value.sections)])];
  return families.flatMap((family) => {
    const setting = config.value.sections[family];
    if (!setting?.enabled) return [];
    const variant = setting.variant === 'theme' ? theme.sectionVariants[family] : setting.variant;
    const entry = sectionRegistry[`${family}-${variant}`];
    return entry ? [{ family, component: entry.component }] : [];
  });
});
const titles: Record<string, string> = {
  hero: 'Good work starts with a conversation.',
  services: 'A considered approach, from start to finish.',
  about: 'People first. Details always.',
  process: 'Simple steps. Shared understanding.',
  testimonials: 'Trust is built in the everyday.',
  faq: 'A few things you might like to know.',
  contact: 'Let’s see what we can do together.',
};
function sectionData(family: string): SectionData {
  return {
    ...demoSection,
    id: family,
    title: titles[family] ?? demoSection.title,
    eyebrow:
      family === 'hero'
        ? 'Lorem ipsum · General business'
        : family === 'services'
          ? 'What we do'
          : family === 'about'
            ? 'A little about us'
            : family === 'testimonials'
              ? 'Illustrative testimonial'
              : family,
  };
}
</script>
<template>
  <div>
    <NewsletterPreview v-if="!sections.some((section) => section.family === 'hero')" />
    <template v-for="section in sections" :key="section.family">
      <ReviewsPreview v-if="section.family === 'testimonials' && reviewsEnabled" />
      <component
        v-else
        :is="section.component"
        :data="sectionData(section.family)"
        @submit="submitted = true"
      />
      <NewsletterPreview v-if="section.family === 'hero'" />
    </template>
    <ReviewsPreview v-if="!sections.some((section) => section.family === 'testimonials')" />
    <BaseModal
      v-model:open="submitted"
      title="Example received"
      description="This is a frontend demonstration. Nothing was sent or stored."
    >
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </BaseModal>
  </div>
</template>
