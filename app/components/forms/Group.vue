<script setup lang="ts">
defineProps<{ legend: string; description?: string }>();
</script>
<template>
  <fieldset class="stack">
    <legend class="label">{{ legend }}</legend>
    <p v-if="description" class="help">{{ description }}</p>
    <slot />
  </fieldset>
</template>
