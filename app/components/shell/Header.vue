<script setup lang="ts">
import { headerAction } from '#shared/data/navigation';
const config = useWebsiteUI();
const customerAuth = useCustomerAuth();
const customerEnabled = useFeature('customer');
const { primary } = useNavigation(customerAuth.isAuthenticated);
onMounted(() => {
  if (customerEnabled.value && customerAuth.status.value === 'unknown') void customerAuth.restore();
});
const open = ref(false);
const { preference } = useColorMode();
</script>
<template>
  <header class="site-header" :data-variant="config.packs.navigation">
    <div class="container header-inner">
      <BusinessLogo />
      <nav class="desktop-nav" aria-label="Primary navigation">
        <NavigationDynamicNav :items="primary" />
      </nav>
      <div class="cluster">
        <label v-if="config.mode === 'user'" class="help">
          <span class="sr-only">Color mode</span>
          <select
            v-model="preference"
            aria-label="Color mode"
            style="background: transparent; max-width: 6rem"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <BaseLink :action="headerAction" button class="desktop-cta">
          {{ headerAction.label }}
          <BaseIcon />
        </BaseLink>
        <BaseButton
          variant="ghost"
          class="mobile-trigger"
          aria-label="Open navigation"
          :aria-expanded="open"
          @click="open = true"
        >
          <BaseIcon name="menu" />
        </BaseButton>
      </div>
    </div>
    <ShellMobileNavigation v-model:open="open" />
  </header>
</template>
