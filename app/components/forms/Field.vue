<script setup lang="ts">
const props = defineProps<{
  label: string;
  id?: string;
  error?: string;
  help?: string;
  required?: boolean;
}>();
const fallback = useId();
const fieldId = computed(() => props.id ?? fallback);
const describedBy = computed(
  () =>
    [props.help ? `${fieldId.value}-help` : '', props.error ? `${fieldId.value}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined,
);
</script>
<template>
  <div class="field">
    <FormsLabel :for="fieldId" :required="required">{{ label }}</FormsLabel>
    <slot :id="fieldId" :described-by="describedBy" :invalid="!!error" />
    <FormsHelp v-if="help" :id="`${fieldId}-help`">{{ help }}</FormsHelp>
    <FormsError v-if="error" :id="`${fieldId}-error`">{{ error }}</FormsError>
  </div>
</template>
