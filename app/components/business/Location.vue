<script setup lang="ts">
import type { BusinessLocation } from '../../../shared/types/business';
withDefaults(
  defineProps<{ location: BusinessLocation; showHours?: boolean; showContact?: boolean }>(),
  { showHours: true, showContact: true },
);
</script>
<template>
  <div class="stack">
    <h3>{{ location.name }}</h3>
    <BusinessAddress :address="location.address" />
    <template v-if="showContact">
      <BusinessPhone v-if="location.contact?.phone" :value="location.contact.phone" />
      <BusinessEmail v-if="location.contact?.email" :value="location.contact.email" />
    </template>
    <BusinessHours
      v-if="showHours && location.hours"
      :hours="location.hours"
      :timezone="location.timezone"
    />
    <BusinessDirections v-if="location.address" :address="location.address" :name="location.name" />
  </div>
</template>
