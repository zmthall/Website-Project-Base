<script setup lang="ts">
const config = useWebsiteUI();
useUITheme();
useStructuredData([{ kind: 'organization' }, { kind: 'website' }], 'site');
</script>
<template>
  <div>
    <div id="page-top" tabindex="-1" />
    <NavigationSkipTo />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :transition="config.motion ? { name: 'page', mode: 'out-in' } : false" />
    </NuxtLayout>
  </div>
</template>
