<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>();
const model = defineModel<boolean>({ default: false });
</script>
<template>
  <label class="check">
    <input v-model="model" type="checkbox" role="switch" :disabled="disabled" />
    <span>{{ label }}</span>
  </label>
</template>
