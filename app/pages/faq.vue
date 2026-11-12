<script setup lang="ts">
import { demoSection } from '../data/demo';
useStructuredData([{ kind: 'faq', items: demoSection.faqs ?? [], path: '/faq' }]);
useSEO({ title: 'Frequently asked questions' });
</script>
<template>
  <SectionsFaqAccordion
    :data="{ ...demoSection, headingLevel: 1, title: 'A little clarity goes a long way.' }"
  />
</template>
