<script setup lang="ts">
const props = defineProps<{ locationId?: string }>();
const business = useBusiness(() => props.locationId);
</script>
<template>
  <div class="stack">
    <p v-if="business.contact.phone" class="cluster">
      <BaseIcon name="phone" />
      <BusinessPhone :value="business.contact.phone" />
    </p>
    <p v-if="business.contact.email" class="cluster">
      <BaseIcon name="email" />
      <BusinessEmail :value="business.contact.email" />
    </p>
    <BusinessAddress v-if="business.location?.address" :address="business.location.address" />
  </div>
</template>
