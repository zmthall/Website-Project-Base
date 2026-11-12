<script setup lang="ts">
const visible = ref(false);
let observer: IntersectionObserver | undefined;
onMounted(() => {
  const top = document.getElementById('page-top');
  if (top) {
    observer = new IntersectionObserver(([entry]) => (visible.value = !entry?.isIntersecting));
    observer.observe(top);
  }
});
onUnmounted(() => observer?.disconnect());
function top() {
  document.getElementById('page-top')?.focus();
  window.scrollTo({ top: 0, behavior: 'auto' });
}
</script>
<template>
  <BaseButton
    v-if="visible"
    class="no-print"
    variant="outline"
    style="position: fixed; bottom: 1rem; right: 1rem; z-index: 40; background: var(--page)"
    @click="top"
  >
    Back to top ↑
  </BaseButton>
</template>
