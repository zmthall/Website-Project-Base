<script setup lang="ts">
defineProps<{ name: string; label?: string }>();
</script>
<template>
  <span
    style="
      display: inline-grid;
      place-items: center;
      padding: 0.8rem;
      background: var(--brand-secondary);
      color: var(--on-secondary);
      border-radius: var(--radius);
    "
  >
    <BaseIcon :name="name" :label="label" />
  </span>
</template>
