<script setup lang="ts">
withDefaults(defineProps<{ value?: number; max?: number; count?: number }>(), { value: 5, max: 5 });
</script>
<template>
  <span
    class="cluster"
    role="img"
    :aria-label="`${value} out of ${max}${count ? ` from ${count} reviews` : ''}`"
  >
    <span aria-hidden="true">
      {{ '★'.repeat(Math.max(0, Math.min(10, Math.round(value))))
      }}{{ '☆'.repeat(Math.max(0, Math.min(10, max - Math.round(value)))) }}
    </span>
    <span v-if="count" aria-hidden="true">({{ count }})</span>
  </span>
</template>
