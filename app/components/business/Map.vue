<script setup lang="ts">
// TODO [MEDIA-01]: Review provider allowlists, CSP, consent revocation and fallback behavior before enabling real map/video integrations; keep tracking inactive until permitted. See docs/integration-audit.md.

import type { BusinessLocation } from '../../../shared/types/business';
import { formatBusinessAddress } from '../../utils/business';
const props = defineProps<{ location: BusinessLocation }>();
const loaded = ref(false);
const src = computed(
  () =>
    `https://maps.google.com/maps?q=${encodeURIComponent(formatBusinessAddress(props.location.address))}&output=embed`,
);
</script>
<template>
  <div v-if="location.address" class="stack">
    <BusinessAddress :address="location.address" />
    <iframe
      v-if="loaded"
      :src="src"
      :title="`Map of ${location.name}`"
      loading="lazy"
      referrerpolicy="no-referrer"
      style="width: 100%; height: 20rem; border: 0"
    />
    <div v-else class="card">
      <p>Load an interactive map from Google Maps.</p>
      <BaseButton variant="outline" @click="loaded = true">Load map</BaseButton>
    </div>
    <BusinessDirections :address="location.address" :name="location.name" />
  </div>
</template>
