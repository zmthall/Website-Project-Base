<script setup lang="ts">
import {
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from 'reka-ui';
defineProps<{ title: string; description?: string }>();
const open = defineModel<boolean>('open', { default: false });
</script>
<template>
  <ToastProvider>
    <ToastRoot v-model:open="open" class="card">
      <ToastTitle>{{ title }}</ToastTitle>
      <ToastDescription>{{ description }}</ToastDescription>
      <ToastClose as-child><BaseButton variant="text">Dismiss</BaseButton></ToastClose>
    </ToastRoot>
    <ToastViewport
      class="no-print"
      style="
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 100;
        width: min(24rem, calc(100% - 2rem));
      "
    />
  </ToastProvider>
</template>
