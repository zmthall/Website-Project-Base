<script setup lang="ts">
defineProps<{ title?: string }>();
</script>
<template>
  <aside class="post-prose-panel post-callout">
    <h3 v-if="title">{{ title }}</h3>
    <slot />
  </aside>
</template>
