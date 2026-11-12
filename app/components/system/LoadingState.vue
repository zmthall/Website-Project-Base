<script setup lang="ts">
defineProps<{ compact?: boolean; label?: string }>();
</script>
<template>
  <div aria-busy="true" role="status">
    <span v-if="compact" class="cluster">
      <BaseSpinner />
      {{ label ?? 'Loading…' }}
    </span>
    <BaseSkeleton v-else />
    <span v-if="!compact" class="sr-only">{{ label ?? 'Loading content' }}</span>
  </div>
</template>
