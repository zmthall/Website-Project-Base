<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false });
const customerAuth = useCustomerAuth();
const { primary } = useNavigation(customerAuth.isAuthenticated);
const route = useRoute();
watch(
  () => route.fullPath,
  () => (open.value = false),
);
</script>
<template>
  <BaseDrawer v-model:open="open" title="Navigation" description="Explore the website.">
    <NavigationDynamicMobileNav :items="primary" @navigate="open = false" />
    <slot />
  </BaseDrawer>
</template>
