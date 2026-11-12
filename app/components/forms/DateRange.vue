<script setup lang="ts">
// TODO [FORMS-01]: Extend runtime field/length/date/locale validation and shared-control parity; repeat every relevant check server-side and retain accessible error/focus behavior for async submissions. See docs/integration-audit.md.

const model = defineModel<{ start: string; end: string }>({
  default: () => ({ start: '', end: '' }),
});
</script>
<template>
  <fieldset class="grid grid-2">
    <legend class="label">Date range</legend>
    <label class="field">
      Start
      <input
        class="input"
        type="date"
        :value="model.start"
        :max="model.end || undefined"
        @input="model = { ...model, start: ($event.target as HTMLInputElement).value }"
      />
    </label>
    <label class="field">
      End
      <input
        class="input"
        type="date"
        :value="model.end"
        :min="model.start || undefined"
        @input="model = { ...model, end: ($event.target as HTMLInputElement).value }"
      />
    </label>
    <p v-if="model.end && model.start > model.end" class="error-text" role="alert">
      End date must follow the start date.
    </p>
  </fieldset>
</template>
