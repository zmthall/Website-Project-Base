<script setup lang="ts">
import type { PricingPlan } from '../../types/blocks';
defineProps<{ plan: PricingPlan }>();
</script>
<template>
  <BaseCard>
    <BaseBadge v-if="plan.featured">Recommended</BaseBadge>
    <h3>{{ plan.name }}</h3>
    <p class="muted">{{ plan.description }}</p>
    <p>
      <del v-if="plan.previousPrice">{{ plan.previousPrice }}</del>
      <strong class="stat">{{ plan.price }}</strong>
      <span>{{ plan.period }}</span>
    </p>
    <ContentList :items="plan.features" />
    <BaseLink v-if="plan.action" :action="plan.action" button />
  </BaseCard>
</template>
