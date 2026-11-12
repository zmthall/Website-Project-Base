<script setup lang="ts">
import type { SocialLink } from '../../../shared/types/social';
defineProps<{ links: readonly SocialLink[] }>();
</script>
<template>
  <ul v-if="links.length" class="cluster">
    <li v-for="link in links" :key="link.href">
      <BaseLink
        :action="{
          type: 'external',
          href: link.href,
          label: link.label ?? link.platform,
          target: '_blank',
        }"
      />
    </li>
  </ul>
</template>
