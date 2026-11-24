<script setup lang="ts">
import type { ManagedRecord } from '#shared/types/management';
import { reviewsConfig, sampleReviews } from '../data/reviews';
useSEO({
  title: 'Reviews',
  description: 'Explore an illustrative collection of customer feedback.',
});
const { data: records } = await useFetch<ManagedRecord[]>('/api/content/reviews');
const reviews = computed(() =>
  records.value?.length
    ? records.value.map((record) => ({
        id: record.id,
        content: String(record.fields.content),
        author: { name: String(record.fields.name) },
        rating: { value: Number(record.fields.rating), scale: 5 },
        date: record.createdAt.slice(0, 10),
      }))
    : sampleReviews,
);
const busy = ref(false);
const error = ref('');
const rating = ref('all');
const sort = ref('newest');
const open = ref(false);
const previewed = ref(false);
const name = ref('');
const content = ref('');
const score = ref('5');
const average = computed(() =>
  (
    reviews.value.reduce((sum, review) => sum + review.rating.value, 0) / reviews.value.length
  ).toFixed(1),
);
const filtered = computed(() =>
  [...reviews.value]
    .filter((review) => rating.value === 'all' || review.rating.value === Number(rating.value))
    .sort((a, b) =>
      sort.value === 'highest'
        ? b.rating.value - a.rating.value || b.date.localeCompare(a.date)
        : sort.value === 'lowest'
          ? a.rating.value - b.rating.value || b.date.localeCompare(a.date)
          : b.date.localeCompare(a.date),
    ),
);
function startDemo() {
  previewed.value = false;
  name.value = '';
  content.value = '';
  score.value = '5';
  open.value = true;
}
async function submitDemo() {
  busy.value = true;
  error.value = '';
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: { name: name.value, content: content.value, rating: Number(score.value) },
    });
    previewed.value = true;
  } catch {
    error.value = 'Your review could not be saved. Please try again.';
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <div class="container section stack">
    <header class="stack">
      <ContentEyebrow>Customer perspectives</ContentEyebrow>
      <h1>Every experience matters.</h1>
      <p v-if="!records?.length" class="muted">
        Illustrative reviews for the website template. These are sample experiences, not verified
        customer feedback.
      </p>
    </header>
    <section class="reviews-summary" aria-label="Sample review summary">
      <div>
        <strong class="reviews-average">{{ average }}</strong>
        <span>/ 5 · {{ reviews.length }} {{ records?.length ? 'reviews' : 'sample reviews' }}</span>
      </div>
      <BaseButton v-if="reviewsConfig.showSubmissionDemo" variant="outline" @click="startDemo">
        Write a review
      </BaseButton>
    </section>
    <h2>Explore the reviews</h2>
    <div class="reviews-controls">
      <label>
        Rating
        <select v-model="rating" aria-label="Filter by rating">
          <option value="all">All ratings</option>
          <option v-for="value in [5, 4, 3, 2, 1]" :key="value" :value="String(value)">
            {{ value }} stars
          </option>
        </select>
      </label>
      <label>
        Sort
        <select v-model="sort" aria-label="Sort reviews">
          <option value="newest">Newest first</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
        </select>
      </label>
      <p class="muted" role="status">{{ filtered.length }} reviews shown</p>
    </div>
    <div v-if="filtered.length" class="grid grid-3">
      <ReviewsCard
        v-for="review in filtered"
        :key="review.id"
        :review="review"
        :illustrative="!records?.length"
      />
    </div>
    <BaseEmptyState
      v-else
      title="No reviews with this rating"
      description="Choose another rating to explore the sample reviews."
    >
      <BaseButton variant="outline" @click="rating = 'all'">Show all reviews</BaseButton>
    </BaseEmptyState>
    <BaseModal
      v-model:open="open"
      title="Write a review"
      description="Reviews are checked by our team before publication."
    >
      <div v-if="previewed" class="stack" role="status">
        <h3>Review received.</h3>
        <p>Thank you. Your review is awaiting moderation.</p>
        <BaseButton variant="outline" @click="open = false">Close</BaseButton>
      </div>
      <p v-if="error" role="alert">{{ error }}</p>
      <form v-if="!previewed" class="stack review-form" @submit.prevent="submitDemo">
        <label>
          Your name
          <input v-model="name" required maxlength="80" autocomplete="name" pattern=".*\S.*" />
        </label>
        <label>
          Your rating
          <select v-model="score">
            <option v-for="value in [5, 4, 3, 2, 1]" :key="value" :value="String(value)">
              {{ value }} stars
            </option>
          </select>
        </label>
        <label>
          Your review
          <textarea v-model="content" required maxlength="2000" rows="5" />
        </label>
        <p class="muted">Please avoid including private or sensitive information.</p>
        <BaseButton type="submit" :disabled="busy || !name.trim() || !content.trim()">
          Submit review
        </BaseButton>
      </form>
    </BaseModal>
  </div>
</template>
<style scoped>
.reviews-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.reviews-average {
  font-size: 3rem;
}
.reviews-controls {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 1rem;
}
label {
  display: grid;
  gap: 0.4rem;
}
select,
input,
textarea {
  color: var(--ink);
  background: var(--field);
  padding: 0.75rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  max-width: 100%;
}
.review-form {
  margin-top: 1rem;
}
</style>
