<script setup lang="ts">
import type { BusinessLocation } from '../../../shared/types/business';
defineProps<{ location: BusinessLocation }>();
</script>
<template>
  <BaseCard><BusinessLocation :location="location" /></BaseCard>
</template>
