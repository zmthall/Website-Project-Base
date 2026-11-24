<script setup lang="ts">
import { demoSection } from '../data/demo';
import { faqs as configuredFaqs } from '../../shared/data/faq';
import type { ManagedRecord } from '../../shared/types/management';

const { data: databaseFaqs } = await useFetch<ManagedRecord[]>('/api/content/faqs');
const faqItems = computed(() => {
  if (!databaseFaqs.value?.length) return configuredFaqs;
  return databaseFaqs.value
    .map((record) => ({
      id: record.id,
      question: String(record.fields.question),
      answer: String(record.fields.answer),
      categoryId: String(record.fields.categoryId || '') || undefined,
      order: Number(record.fields.order) || undefined,
    }))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
});
const section = computed(() => ({
  ...demoSection,
  headingLevel: 1 as const,
  title: 'A little clarity goes a long way.',
  faqs: faqItems.value,
}));

useStructuredData(() => [{ kind: 'faq', items: faqItems.value, path: '/faq' }]);
useSEO({ title: 'Frequently asked questions' });
</script>
<template>
  <SectionsFaqAccordion :data="section" />
</template>
