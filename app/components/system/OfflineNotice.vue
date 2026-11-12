<script setup lang="ts">
const offline = ref(false);
function update() {
  offline.value = !navigator.onLine;
}
onMounted(() => {
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
});
onUnmounted(() => {
  window.removeEventListener('online', update);
  window.removeEventListener('offline', update);
});
</script>
<template>
  <BaseAlert v-if="offline" tone="warning">
    Your browser is offline. Network actions may be unavailable.
  </BaseAlert>
</template>
