<script setup lang="ts">
defineProps<{ text?: string; attribution?: string; source?: string }>();
</script>
<template>
  <figure>
    <blockquote class="quote">
      <slot>{{ text }}</slot>
    </blockquote>
    <figcaption v-if="attribution || source" class="muted" style="margin-top: 1.25rem">
      {{ attribution }}
      <cite v-if="source">· {{ source }}</cite>
    </figcaption>
  </figure>
</template>
