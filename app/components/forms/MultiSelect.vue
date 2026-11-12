<script setup lang="ts">
import type { FormOption } from '../../types/forms';
defineProps<{ options: FormOption[]; label: string }>();
const model = defineModel<string[]>({ default: () => [] });
</script>
<template>
  <fieldset class="stack">
    <legend class="label">{{ label }}</legend>
    <label v-for="option in options" :key="option.value" class="check">
      <input v-model="model" type="checkbox" :value="option.value" :disabled="option.disabled" />
      {{ option.label }}
    </label>
  </fieldset>
</template>
