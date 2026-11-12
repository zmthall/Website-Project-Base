<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), {
  label: 'I confirm that the information provided is accurate.',
});
const model = defineModel<boolean>({ default: false });
</script>
<template><FormsCheckbox v-model="model" :label="label" /></template>
