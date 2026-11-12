<script setup lang="ts">
const props = withDefaults(defineProps<{ phone?: string; locationId?: string; label?: string }>(), {
  label: 'Call us',
});
const business = useBusiness(() => props.locationId);
const value = computed(() => props.phone ?? business.value.contact.phone);
defineEmits<{ call: [] }>();
</script>
<template>
  <BaseLink v-if="value" :action="{ type: 'phone', value, label }" button @click="$emit('call')">
    <BaseIcon name="phone" />
    {{ label }}
  </BaseLink>
</template>
