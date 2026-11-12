<script setup lang="ts">
import type { Testimonial } from '../../../shared/types/testimonials';
defineProps<{ review: Testimonial; featured?: boolean }>();
</script>
<template>
  <BaseCard as="article">
    <BaseRating v-if="review.rating" :value="review.rating.value" :max="review.rating.scale ?? 5" />
    <blockquote :class="{ quote: featured }">{{ review.content }}</blockquote>
    <div class="cluster">
      <MediaAppImage
        v-if="review.author.image"
        :image="{ ...review.author.image, width: 48, height: 48, sizes: '48px' }"
        class="avatar"
      />
      <div>
        <strong>{{ review.author.name }}</strong>
        <p class="help">{{ review.author.role }} {{ review.author.organization }}</p>
      </div>
    </div>
    <time v-if="review.date" :datetime="review.date" class="help">{{ review.date }}</time>
    <BaseLink
      v-if="review.source?.href"
      :action="{ type: 'external', href: review.source.href, label: review.source.name }"
    />
  </BaseCard>
</template>
