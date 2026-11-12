<script setup lang="ts">
import type { BusinessHours } from '../../../shared/types/business';
defineProps<{ hours: BusinessHours; timezone: string }>();
</script>
<template>
  <BaseCard>
    <h3>Opening hours</h3>
    <BusinessHoursStatus :hours="hours" :timezone="timezone" />
    <BusinessHours :hours="hours" :timezone="timezone" />
  </BaseCard>
</template>
