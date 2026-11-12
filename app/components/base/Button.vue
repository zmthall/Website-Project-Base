<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    block?: boolean;
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
);
</script>
<template>
  <button
    :type="type"
    class="btn"
    :data-variant="variant"
    :data-size="size"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :style="block ? { width: '100%' } : undefined"
  >
    <BaseSpinner v-if="loading" />
    <slot />
  </button>
</template>
