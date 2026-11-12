<script setup lang="ts">
import type { ImageMedia } from '../../../shared/types/image';
const props = defineProps<{ image: ImageMedia; format?: string; densities?: string }>();
const failed = ref(false);
watch(
  () => props.image.src,
  () => (failed.value = false),
);
</script>
<template>
  <div
    v-if="failed"
    class="surface"
    role="img"
    :aria-label="image.decorative ? '' : image.alt"
    style="aspect-ratio: 4/3; display: grid; place-items: center"
  >
    Image unavailable
  </div>
  <NuxtImg
    v-else
    :src="image.src"
    :alt="image.decorative ? '' : image.alt"
    :width="image.width ?? 1200"
    :height="image.height ?? 900"
    :sizes="image.sizes ?? '100vw sm:100vw md:50vw lg:600px'"
    :densities="densities ?? '1x 2x'"
    :format="format"
    :quality="image.quality ?? 80"
    :loading="image.loading ?? 'lazy'"
    :fetchpriority="image.fetchPriority ?? 'auto'"
    :style="{
      objectFit: 'cover',
      objectPosition: image.crop?.focalPoint
        ? `${image.crop.focalPoint.x * 100}% ${image.crop.focalPoint.y * 100}%`
        : 'center',
    }"
    @error="failed = true"
  />
</template>
