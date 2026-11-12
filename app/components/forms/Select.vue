<script setup lang="ts">
import type { FormOption } from '../../types/forms';
defineProps<{ options: FormOption[]; placeholder?: string }>();
const model = defineModel<string>({ default: '' });
</script>
<template>
  <select v-model="model" class="input">
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>
  </select>
</template>
