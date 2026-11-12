<script setup lang="ts">
import type { AggregateRating } from '../../../shared/types/rating';
defineProps<{ rating: AggregateRating }>();
</script>
<template>
  <BaseRating
    :value="rating.value"
    :max="rating.scale ?? 5"
    :count="rating.reviewCount ?? rating.ratingCount"
  />
</template>
