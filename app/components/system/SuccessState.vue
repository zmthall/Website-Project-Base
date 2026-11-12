<script setup lang="ts">
import type { Action } from '../../../shared/types/action';
withDefaults(defineProps<{ title?: string; message?: string; actions?: Action[] }>(), {
  title: 'All done',
  message: 'Your changes are ready.',
});
</script>
<template>
  <BaseAlert tone="success" :title="title">
    <p>{{ message }}</p>
    <ContentCTA v-if="actions" :actions="actions" />
    <slot />
  </BaseAlert>
</template>
