<script setup lang="ts">
defineProps<{ title?: string; locationId?: string }>();
</script>
<template>
  <BaseCard>
    <h3>{{ title ?? 'Get in touch' }}</h3>
    <BusinessContactMethods :location-id="locationId" />
    <slot />
  </BaseCard>
</template>
