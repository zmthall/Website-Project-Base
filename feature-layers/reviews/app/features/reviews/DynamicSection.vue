<script setup lang="ts">
import type { Testimonial } from '../../../../../shared/types/testimonials';
withDefaults(
  defineProps<{
    reviews: Testimonial[];
    title?: string;
    variant?: 'grid' | 'carousel' | 'featured';
    loading?: boolean;
    error?: string;
  }>(),
  { title: 'Customer reviews', variant: 'grid' },
);
</script>
<template>
  <BaseEmptyState v-if="!loading && !error && !reviews.length" title="No reviews yet" />
  <SectionsInternalRenderer
    v-else
    family="testimonials"
    :variant="variant"
    :data="{ title, testimonials: reviews, loading, error }"
  />
</template>
