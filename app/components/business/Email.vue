<script setup lang="ts">
const props = withDefaults(
  defineProps<{ value?: string; locationId?: string; linked?: boolean; label?: string }>(),
  { linked: true },
);
const business = useBusiness(() => props.locationId);
const email = computed(() => props.value ?? business.value.contact.email);
</script>
<template>
  <BaseLink
    v-if="email && linked"
    :action="{ type: 'email', value: email, label: label ?? email }"
  />
  <span v-else-if="email">{{ label ?? email }}</span>
</template>
