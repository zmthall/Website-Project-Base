<script setup lang="ts">
import { reviewsConfig, sampleReviews } from '#shared/data/reviews';
const enabled = useFeature('reviews');
</script>
<template>
  <section
    v-if="enabled && reviewsConfig.homepagePreview"
    class="container section stack"
    aria-labelledby="reviews-preview-heading"
  >
    <ContentEyebrow>Reviews · Sample content</ContentEyebrow>
    <h2 id="reviews-preview-heading">Good experiences, in their words.</h2>
    <p class="muted">
      A preview of how customer feedback can appear on your website. These reviews are illustrative.
    </p>
    <div class="grid grid-3">
      <ReviewsCard v-for="review in sampleReviews.slice(0, 3)" :key="review.id" :review="review" />
    </div>
    <NuxtLink to="/reviews" class="btn" data-variant="outline" style="align-self: flex-start">
      Explore all reviews
      <span aria-hidden="true">→</span>
    </NuxtLink>
  </section>
</template>
