<script setup lang="ts">
defineProps<{ label?: string; id?: string; required?: boolean; disabled?: boolean }>();
const model = defineModel<boolean>({ default: false });
</script>
<template>
  <label class="check">
    <input :id="id" v-model="model" type="checkbox" :required="required" :disabled="disabled" />
    <span>
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
