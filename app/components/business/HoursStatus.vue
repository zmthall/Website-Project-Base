<script setup lang="ts">
import type { BusinessHours } from '../../../shared/types/business';
import { businessHoursStatus } from '../../utils/hours';
const props = defineProps<{ hours: BusinessHours; timezone: string }>();
const timestamp = useState('business-clock', () => Date.now());
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  timestamp.value = Date.now();
  timer = setInterval(() => (timestamp.value = Date.now()), 60000);
});
onUnmounted(() => clearInterval(timer));
const status = computed(() => {
  try {
    return businessHoursStatus(props.hours, props.timezone, new Date(timestamp.value));
  } catch {
    return undefined;
  }
});
</script>
<template>
  <p v-if="status" class="help">
    {{ status.open ? 'Open now' : 'Closed now' }}
    <span v-if="status.nextChange">
      · {{ status.open ? 'Closes' : 'Opens' }} {{ status.nextChange }}
    </span>
  </p>
  <p v-else class="help">Contact us to confirm opening hours.</p>
</template>
