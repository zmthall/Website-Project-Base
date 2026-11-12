<script setup lang="ts">
withDefaults(defineProps<{ lines?: number }>(), { lines: 3 });
</script>
<template>
  <div class="stack" role="status" aria-label="Loading">
    <div v-for="line in lines" :key="line" class="skeleton" />
    <span class="sr-only">Loading</span>
  </div>
</template>
