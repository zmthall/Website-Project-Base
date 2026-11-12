<script setup lang="ts">
import type { ServiceArea } from '../../../shared/types/business';
defineProps<{ areas: readonly ServiceArea[]; compact?: boolean }>();
</script>
<template>
  <ul class="stack">
    <li v-for="area in areas" :key="area.name">
      <strong>{{ area.name }}</strong>
      <template v-if="!compact">
        <p v-if="area.localities?.length">{{ area.localities.join(', ') }}</p>
        <p v-if="area.postalCodes?.length">Postal codes: {{ area.postalCodes.join(', ') }}</p>
      </template>
    </li>
  </ul>
</template>
