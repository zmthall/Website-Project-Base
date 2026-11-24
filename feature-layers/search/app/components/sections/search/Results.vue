<script setup lang="ts">
import type { SectionData } from '../../../../../../app/types/sections';
import type { FormValue } from '../../../../../../app/types/forms';
defineProps<{ data: SectionData }>();
defineEmits<{ submit: [values: Record<string, FormValue>] }>();
</script>
<template>
  <SectionsInternalRenderer
    family="search"
    variant="results"
    :data="data"
    @submit="$emit('submit', $event)"
  >
    <slot />
  </SectionsInternalRenderer>
</template>
