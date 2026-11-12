<script setup lang="ts">
import type { ImageMedia } from '../../../shared/types/image';
withDefaults(defineProps<{ image: ImageMedia; overlay?: boolean }>(), { overlay: true });
</script>
<template>
  <div style="position: relative; isolation: isolate; overflow: hidden">
    <MediaAppImage
      :image="{ ...image, decorative: true, alt: '', sizes: '100vw' }"
      style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: -2"
    />
    <div v-if="overlay" style="position: absolute; inset: 0; background: #000b; z-index: -1" />
    <div :style="overlay ? { color: 'white' } : undefined"><slot /></div>
  </div>
</template>
