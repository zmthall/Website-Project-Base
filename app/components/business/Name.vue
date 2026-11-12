<script setup lang="ts">
withDefaults(defineProps<{ legal?: boolean; as?: 'span' | 'p' | 'strong' }>(), { as: 'span' });
const business = useBusiness();
</script>
<template>
  <component :is="as">{{ legal ? business.legalName : business.name }}</component>
</template>
