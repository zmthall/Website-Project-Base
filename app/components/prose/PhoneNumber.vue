<script setup lang="ts">
const props = defineProps<{ number?: string; department?: string }>();
const site = useSiteConfig();
const number = computed(() => props.number || site.business?.contact?.phone || '');
const telephone = computed(() => String(number.value).replace(/[^+0-9]/g, ''));
</script>
<template>
  <a v-if="telephone" :href="`tel:${telephone}`" class="post-prose-link">{{ number }}</a>
  <span v-else>—</span>
</template>
