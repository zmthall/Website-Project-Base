<script setup lang="ts">
withDefaults(defineProps<{ min?: number; max?: number; step?: number; label?: string }>(), {
  min: 0,
  max: 100,
  step: 1,
  label: 'Value',
});
const model = defineModel<number>({ default: 50 });
const id = useId();
</script>
<template>
  <label class="field" :for="id">
    {{ label }}:
    <output>{{ model }}</output>
    <input :id="id" v-model.number="model" type="range" :min="min" :max="max" :step="step" />
  </label>
</template>
