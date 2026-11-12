<script setup lang="ts">
const props = withDefaults(
  defineProps<{ value?: string; locationId?: string; linked?: boolean; label?: string }>(),
  { linked: true },
);
const business = useBusiness(() => props.locationId);
const number = computed(() => props.value ?? business.value.contact.phone);
</script>
<template>
  <BaseLink
    v-if="number && linked"
    :action="{ type: 'phone', value: number, label: label ?? number }"
  />
  <span v-else-if="number">{{ label ?? number }}</span>
</template>
