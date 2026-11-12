<script setup lang="ts">
import type { Address } from '../../../shared/types/business';
import { formatBusinessAddress } from '../../utils/business';
const props = defineProps<{ address: Address; name?: string; button?: boolean }>();
const href = computed(
  () =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatBusinessAddress(props.address))}`,
);
</script>
<template>
  <BaseLink
    :action="{
      type: 'external',
      href,
      label: `Directions${name ? ` to ${name}` : ''}`,
      target: '_blank',
    }"
    :button="button"
  />
</template>
