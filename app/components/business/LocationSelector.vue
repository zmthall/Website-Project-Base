<script setup lang="ts">
import type { BusinessLocation } from '../../../shared/types/business';
const props = defineProps<{ locations: BusinessLocation[] }>();
const model = defineModel<string>();
onMounted(() => {
  if (!model.value)
    model.value = (props.locations.find((l) => l.primary) ?? props.locations[0])?.id;
});
</script>
<template>
  <label class="field">
    Choose a location
    <select v-model="model" class="input">
      <option value="" disabled>Select location</option>
      <option v-for="location in locations" :key="location.id" :value="location.id">
        {{ location.name }}
      </option>
    </select>
  </label>
</template>
