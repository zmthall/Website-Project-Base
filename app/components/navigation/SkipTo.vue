<script setup lang="ts">
withDefaults(defineProps<{ target?: string }>(), { target: 'main-content' });
</script>
<template><a class="skip-link" :href="`#${target}`">Skip to main content</a></template>
