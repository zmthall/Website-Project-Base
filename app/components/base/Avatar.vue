<script setup lang="ts">
const props = withDefaults(defineProps<{ src?: string; name?: string }>(), { name: 'Lorem Ipsum' });
const initials = computed(() =>
  props.name
    .split(' ')
    .map((v) => v[0])
    .slice(0, 2)
    .join(''),
);
</script>
<template>
  <img v-if="src" class="avatar" :src="src" :alt="name" width="48" height="48" />
  <span v-else class="avatar" role="img" :aria-label="name">{{ initials }}</span>
</template>
