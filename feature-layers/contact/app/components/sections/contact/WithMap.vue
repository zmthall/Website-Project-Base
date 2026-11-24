<script setup lang="ts">
import type { SectionData } from '../../../../../../app/types/sections';
import ContactSection from '../../contact/Section.vue';
defineProps<{ data: SectionData }>();
defineEmits<{
  submit: [values: Record<string, import('../../../../../../app/types/forms').FormValue>];
}>();
</script>
<template>
  <ContactSection
    variant="withmap"
    :data="data"
    @submit="$emit('submit', $event)"
  >
    <slot />
  </ContactSection>
</template>
