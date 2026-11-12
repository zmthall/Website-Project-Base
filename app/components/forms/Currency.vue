<script setup lang="ts">
withDefaults(defineProps<{ currency?: string; locale?: string; label?: string }>(), {
  currency: 'USD',
  locale: 'en-US',
  label: 'Amount',
});
const model = defineModel<string | number>({ default: '' });
</script>
<template>
  <label class="field">
    {{ label }} ({{ currency }})
    <FormsInput v-model="model" type="number" step="0.01" inputmode="decimal" />
    <span v-if="model !== ''" class="help">
      {{ new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(model)) }}
    </span>
  </label>
</template>
