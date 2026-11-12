<script setup lang="ts">
defineProps<{ title?: string; description?: string }>();
const open = defineModel<boolean>('open', { default: false });
</script>
<template>
  <BaseModal v-model:open="open" :title="title" :description="description" drawer>
    <slot />
  </BaseModal>
</template>
