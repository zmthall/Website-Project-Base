<script setup lang="ts">
defineProps<{ icon?: string }>();
</script>
<template>
  <p class="eyebrow cluster">
    <BaseIcon v-if="icon" :name="icon" :size="16" />
    <slot />
  </p>
</template>
