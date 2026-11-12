<script setup lang="ts">
import type { SectionData } from '../../../types/sections';
defineProps<{ data: SectionData }>();
defineEmits<{ submit: [values: Record<string, import('../../../types/forms').FormValue>] }>();
</script>
<template>
  <SectionsInternalRenderer
    family="features"
    variant="alternating"
    :data="data"
    @submit="$emit('submit', $event)"
  >
    <slot />
  </SectionsInternalRenderer>
</template>
