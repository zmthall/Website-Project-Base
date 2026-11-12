<script setup lang="ts">
withDefaults(defineProps<{ as?: 'span' | 'div' }>(), { as: 'span' });
</script>
<template>
  <component :is="as" class="sr-only"><slot /></component>
</template>
