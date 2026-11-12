<script setup lang="ts">
const config = useWebsiteUI();
</script>
<template>
  <div>
    <SystemOfflineNotice />
    <NewsletterBanner />
    <ShellHeader v-if="config.shell.header" />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <ShellFooter v-if="config.shell.footer" />
    <ShellCookieBanner :enabled="config.shell.cookieBanner" />
    <NavigationBackToTop v-if="config.shell.backToTop" />
  </div>
</template>
