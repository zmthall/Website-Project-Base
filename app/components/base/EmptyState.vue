<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: 'No results yet',
  description: 'Try a different search or add your first item.',
});
</script>
<template>
  <div class="card centered stack">
    <BaseIcon name="search" style="margin-inline: auto" />
    <h3>{{ title }}</h3>
    <p class="muted">{{ description }}</p>
    <div><slot /></div>
  </div>
</template>
