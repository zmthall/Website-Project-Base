<script setup lang="ts">
withDefaults(defineProps<{ value?: number; max?: number; label?: string }>(), {
  max: 100,
  label: 'Progress',
});
</script>
<template>
  <label class="field">
    {{ label }}
    <progress :value="value" :max="max" style="width: 100%" />
  </label>
</template>
