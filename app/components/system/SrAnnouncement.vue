<script setup lang="ts">
withDefaults(defineProps<{ message?: string; priority?: 'polite' | 'assertive' }>(), {
  priority: 'polite',
});
</script>
<template>
  <div class="sr-only" :aria-live="priority" aria-atomic="true">{{ message }}</div>
</template>
