<script setup lang="ts">
import type { Address } from '../../../shared/types/business';
import { formatBusinessAddress } from '../../utils/business';
defineProps<{ address?: Address; multiline?: boolean }>();
</script>
<template>
  <address v-if="address" style="font-style: normal">
    <template v-if="multiline">
      {{ address.line1 }}
      <br />
      <template v-if="address.line2">
        {{ address.line2 }}
        <br />
      </template>
      {{ address.locality }}, {{ address.region }} {{ address.postalCode }}
      <br />
      {{ address.countryCode }}
    </template>
    <template v-else>{{ formatBusinessAddress(address) }}</template>
  </address>
</template>
