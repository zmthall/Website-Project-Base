<script setup lang="ts">
withDefaults(
  defineProps<{
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: 'small' | 'medium' | 'large';
    align?: 'left' | 'center' | 'right';
    id?: string;
  }>(),
  { level: 2, align: 'left' },
);
</script>
<template>
  <component
    :is="`h${level}`"
    :id="id"
    :style="{
      textAlign: align,
      fontSize:
        size === 'small'
          ? '1.35rem'
          : size === 'medium'
            ? '2rem'
            : size === 'large'
              ? '3rem'
              : undefined,
    }"
  >
    <slot />
  </component>
</template>
