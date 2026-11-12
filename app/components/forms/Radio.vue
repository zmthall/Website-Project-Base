<script setup lang="ts">
import type { FormOption } from '../../types/forms';
defineProps<{ options: FormOption[]; label: string; required?: boolean }>();
const model = defineModel<string>({ default: '' });
const name = useId();
</script>
<template>
  <fieldset class="stack">
    <legend class="label">{{ label }}</legend>
    <label v-for="option in options" :key="option.value" class="check">
      <input
        v-model="model"
        type="radio"
        :name="name"
        :value="option.value"
        :disabled="option.disabled"
        :required="required"
      />
      {{ option.label }}
    </label>
  </fieldset>
</template>
