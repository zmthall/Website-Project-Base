<script setup lang="ts">
withDefaults(defineProps<{ label?: string; max?: number }>(), { label: 'Your rating', max: 5 });
const model = defineModel<string>({ default: '' });
</script>
<template>
  <FormsRadio
    v-model="model"
    :label="label"
    :options="
      Array.from({ length: max }, (_, i) => ({ value: String(i + 1), label: `${i + 1} stars` }))
    "
  />
</template>
