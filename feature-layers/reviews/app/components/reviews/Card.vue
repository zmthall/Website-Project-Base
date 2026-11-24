<script setup lang="ts">
import type { Testimonial } from '../../../../../shared/types/testimonials';
const props = defineProps<{ review: Testimonial; illustrative?: boolean }>();
const scale = computed(() => props.review.rating?.scale ?? 5);
const stars = computed(() =>
  Math.max(0, Math.min(5, Math.round(((props.review.rating?.value ?? 0) / scale.value) * 5))),
);
function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
</script>
<template>
  <figure class="review-card stack">
    <span
      v-if="review.rating"
      class="review-rating"
      role="img"
      :aria-label="`${review.rating.value} out of ${scale} stars`"
    >
      <span aria-hidden="true">{{ '★'.repeat(stars) }}{{ '☆'.repeat(5 - stars) }}</span>
    </span>
    <blockquote>
      <p>{{ review.content }}</p>
    </blockquote>
    <figcaption>
      <strong>{{ review.author.name }}</strong>
      <time v-if="review.date" :datetime="review.date">{{ dateLabel(review.date) }}</time>
      <small v-if="illustrative !== false">Illustrative review</small>
    </figcaption>
  </figure>
</template>
<style scoped>
.review-card {
  margin: 0;
  height: 100%;
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
}
.review-rating {
  letter-spacing: 0.15em;
  font-size: 1.2rem;
}
blockquote {
  margin: 0;
  flex: 1;
}
figcaption {
  display: grid;
  gap: 0.25rem;
}
time,
small {
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
