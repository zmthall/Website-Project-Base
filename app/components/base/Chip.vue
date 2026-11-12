<script setup lang="ts">
defineProps<{ removable?: boolean; label?: string }>();
defineEmits<{ remove: [] }>();
</script>
<template>
  <span class="badge">
    <slot>{{ label }}</slot>
    <button
      v-if="removable"
      type="button"
      :aria-label="`Remove ${label ?? 'item'}`"
      @click="$emit('remove')"
    >
      <BaseIcon name="close" :size="14" />
    </button>
  </span>
</template>
