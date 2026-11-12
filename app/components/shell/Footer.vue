<script setup lang="ts">
const config = useWebsiteUI();
const { footer } = useNavigation();
</script>
<template>
  <footer class="site-footer">
    <div class="container">
      <div
        :class="config.packs.footer === 'columns' ? 'footer-grid' : 'stack'"
        :style="
          config.packs.footer === 'centered'
            ? { textAlign: 'center', alignItems: 'center' }
            : undefined
        "
      >
        <div class="stack">
          <BusinessLogo />
          <p class="muted" style="max-width: 28ch; font-size: 0.875rem">
            Lorem ipsum dolor sit amet. A considered foundation for what comes next.
          </p>
          <BusinessSocials />
        </div>
        <nav
          v-for="group in config.packs.footer === 'minimal' ? footer.slice(0, 1) : footer"
          :key="group.label"
          :aria-label="group.label ?? 'Footer links'"
        >
          <h3 style="font-size: 0.85rem; margin-bottom: 1rem">{{ group.label }}</h3>
          <NavigationDynamicMobileNav :items="group.items" />
        </nav>
      </div>
      <div class="footer-bottom">
        <BusinessCopyright />
        <div class="cluster">
          <NuxtLink to="/showcase">Component showcase</NuxtLink>
          <NuxtLink to="/privacy">Privacy</NuxtLink>
          <NuxtLink to="/terms">Terms</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
