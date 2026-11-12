<script setup lang="ts">
defineProps<{ for?: string; required?: boolean }>();
</script>
<template>
  <label :for="$props.for" class="label">
    <slot />
    <span v-if="required" aria-hidden="true">*</span>
  </label>
</template>
