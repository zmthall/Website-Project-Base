<script setup lang="ts">
const emit = defineEmits<{ error: [error: unknown] }>();
const failed = ref(false);
const generation = ref(0);
onErrorCaptured((error) => {
  failed.value = true;
  emit('error', error);
  return false;
});
function retry() {
  failed.value = false;
  generation.value++;
}
</script>
<template>
  <SystemErrorState v-if="failed" @retry="retry" />
  <div v-else :key="generation"><slot /></div>
</template>
