<script setup lang="ts">
defineProps<{ fullWidth?: boolean }>();
</script>
<template>
  <section class="post-prose-panel post-references">
    <h2>References</h2>
    <slot />
  </section>
</template>
