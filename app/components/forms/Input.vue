<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
  }>(),
  { type: 'text' },
);
const model = defineModel<string | number>({ default: '' });
</script>
<template>
  <input
    :id="id"
    v-model="model"
    class="input"
    :type="type"
    :disabled="disabled"
    :required="required"
    :aria-invalid="invalid || undefined"
  />
</template>
