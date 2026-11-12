<script setup lang="ts">
import { demoSection } from '../../data/demo';
</script>
<template>
  <div class="stack">
    <div class="grid grid-2">
      <BlocksLocationCard :location="demoSection.locations![0]!" />
      <BlocksHoursCard :hours="demoSection.locations![0]!.hours!" timezone="America/Denver" />
      <BlocksContactCard />
      <div class="stack">
        <BusinessName />
        <BusinessCallButton />
        <BusinessServiceArea :areas="demoSection.areas!" />
        <BusinessRating :rating="{ value: 4.8, reviewCount: 120 }" />
        <BusinessStatus message="Example operational notice" />
      </div>
    </div>
    <h3>Optional external map</h3>
    <BusinessMap :location="demoSection.locations![0]!" />
  </div>
</template>
