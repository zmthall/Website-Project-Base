<script setup lang="ts">
defineProps<{ fullWidth?: boolean }>();
</script>
<template>
  <section class="post-prose-panel at-a-glance">
    <h2>At a Glance</h2>
    <slot />
  </section>
</template>
