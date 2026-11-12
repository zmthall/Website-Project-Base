<script setup lang="ts">
import { demoSection } from '../../data/demo';
const route = useRoute();
const service = computed(() => demoSection.services?.find((s) => s.slug === route.params.slug));
if (!service.value) throw createError({ statusCode: 404, statusMessage: 'Service not found' });
useStructuredData(() =>
  service.value ? [{ kind: 'service', service: service.value, path: route.path }] : [],
);
useSEO(() => ({ title: service.value?.name }));
</script>
<template>
  <div v-if="service">
    <SectionsHeroSplit
      :data="{
        ...demoSection,
        title: service.name,
        description: service.summary,
        image: service.image,
      }"
    />
    <SectionsProcessSteps
      :data="{ ...demoSection, title: 'From first conversation to next steps' }"
    />
  </div>
</template>
