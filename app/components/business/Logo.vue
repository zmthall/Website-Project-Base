<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean; linked?: boolean }>(), { linked: true });
const business = useBusiness();
</script>
<template>
  <component :is="linked ? 'a' : 'span'" :href="linked ? '/' : undefined" class="brand">
    <MediaAppImage
      v-if="business.logo"
      :image="{
        ...(compact ? (business.logoCompact ?? business.logo) : business.logo),
        width: 120,
        height: 40,
        sizes: '120px',
        loading: 'eager',
      }"
    />
    <template v-else>
      <span class="brand-mark" aria-hidden="true">{{ business.name.slice(0, 1) }}</span>
      {{ business.name }}
    </template>
  </component>
</template>
