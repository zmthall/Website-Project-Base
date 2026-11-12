<script setup lang="ts">
defineProps<{ text?: string }>();
const business = useBusiness();
const year = useState('copyright-year', () => new Date().getUTCFullYear());
</script>
<template>
  <small>{{ text ?? `© ${year} ${business.legalName}. All rights reserved.` }}</small>
</template>
