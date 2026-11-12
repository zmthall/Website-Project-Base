<script setup lang="ts">
withDefaults(defineProps<{ title?: string; tone?: 'info' | 'success' | 'danger' | 'warning' }>(), {
  tone: 'info',
});
</script>
<template>
  <div class="alert" :data-tone="tone" :role="tone === 'danger' ? 'alert' : 'status'">
    <strong v-if="title">{{ title }}</strong>
    <div><slot /></div>
  </div>
</template>
