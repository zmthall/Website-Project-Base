<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'p' | 'span' | 'div';
    muted?: boolean;
    align?: 'left' | 'center' | 'right';
  }>(),
  { as: 'p' },
);
</script>
<template>
  <component :is="as" :class="{ muted }" :style="{ textAlign: align }"><slot /></component>
</template>
