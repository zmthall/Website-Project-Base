<script setup lang="ts">
const site = useSiteConfig();
</script>
<template><NavigationSocialLinks :links="site.business.socials ?? []" /></template>
