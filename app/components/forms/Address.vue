<script setup lang="ts">
// TODO [FORMS-01]: Extend runtime field/length/date/locale validation and shared-control parity; repeat every relevant check server-side and retain accessible error/focus behavior for async submissions. See docs/integration-audit.md.

import type { Address } from '../../../shared/types/business';
const model = defineModel<Address>({
  default: () => ({
    line1: '',
    line2: '',
    locality: '',
    region: '',
    postalCode: '',
    countryCode: '',
  }),
});
const fields = [
  { key: 'line1', label: 'Street address', autocomplete: 'address-line1' },
  { key: 'line2', label: 'Apartment or suite', autocomplete: 'address-line2' },
  { key: 'locality', label: 'City', autocomplete: 'address-level2' },
  { key: 'region', label: 'State or region', autocomplete: 'address-level1' },
  { key: 'postalCode', label: 'Postal code', autocomplete: 'postal-code' },
  { key: 'countryCode', label: 'Country code', autocomplete: 'country' },
] as const;
</script>
<template>
  <fieldset class="grid grid-2">
    <legend class="label">Address</legend>
    <label v-for="field in fields" :key="field.key" class="field">
      {{ field.label }}
      <input
        class="input"
        :value="model[field.key]"
        :autocomplete="field.autocomplete"
        @input="model = { ...model, [field.key]: ($event.target as HTMLInputElement).value }"
      />
    </label>
  </fieldset>
</template>
