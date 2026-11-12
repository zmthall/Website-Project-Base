<script setup lang="ts">
import type { FormOption } from '../../types/forms';
defineProps<{ options: FormOption[]; label: string }>();
const model = defineModel<string>({ default: '' });
const id = useId();
</script>
<template>
  <label class="field">
    {{ label }}
    <input v-model="model" class="input" :list="id" />
    <datalist :id="id">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </datalist>
  </label>
</template>
