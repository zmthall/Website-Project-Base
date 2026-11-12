<script setup lang="ts">
withDefaults(defineProps<{ as?: 'div' | 'article' | 'section' }>(), { as: 'div' });
</script>
<template>
  <component :is="as" class="card"><slot /></component>
</template>
