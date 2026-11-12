<script setup lang="ts">
import type { Action } from '../../../shared/types/action';
withDefaults(defineProps<{ title?: string; message?: string; actions?: Action[] }>(), {
  title: 'Something went wrong',
  message: 'Please try again.',
});
defineEmits<{ retry: [] }>();
</script>
<template>
  <BaseAlert tone="danger" :title="title">
    <p>{{ message }}</p>
    <ContentCTA v-if="actions" :actions="actions" />
    <slot><BaseButton variant="text" @click="$emit('retry')">Try again</BaseButton></slot>
  </BaseAlert>
</template>
