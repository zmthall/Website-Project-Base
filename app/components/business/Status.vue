<script setup lang="ts">
defineProps<{ message?: string; tone?: 'info' | 'success' | 'warning' }>();
</script>
<template>
  <BaseAlert v-if="message" :tone="tone">{{ message }}</BaseAlert>
  <slot v-else />
</template>
