<script setup lang="ts">
import { safeMediaURL } from '../../utils/media';
defineProps<{
  to?: string;
  href?: string;
  variant?: string;
  styling?: string;
  name?: string;
  title?: string;
  message?: string;
}>();
</script>
<template>
  <div class="post-center-layout">
    <a v-if="safeMediaURL(to || href || '')" :href="to || href" class="post-cta-tile">
      <strong v-if="title">{{ title }}</strong>
      <p v-if="message">{{ message }}</p>
      <MDCSlot :use="$slots.default" unwrap="p" />
    </a>
    <div v-else class="post-cta-tile">
      <strong v-if="title">{{ title }}</strong>
      <p v-if="message">{{ message }}</p>
      <MDCSlot :use="$slots.default" unwrap="p" />
    </div>
  </div>
</template>
