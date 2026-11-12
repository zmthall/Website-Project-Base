<script setup lang="ts">
import type { ImageMedia } from '../../../shared/types/image';
defineProps<{ image: ImageMedia; mobile?: ImageMedia }>();
const imageUrl = useImage();
</script>
<template>
  <picture v-if="mobile">
    <source
      media="(max-width: 600px)"
      :srcset="imageUrl(mobile.src, { width: 600, format: 'webp' })"
    />
    <MediaAppImage :image="image" />
  </picture>
  <NuxtPicture
    v-else
    :src="image.src"
    :alt="image.decorative ? '' : image.alt"
    :width="image.width ?? 1200"
    :height="image.height ?? 900"
    :sizes="image.sizes ?? '100vw md:50vw'"
    format="avif,webp"
    :loading="image.loading ?? 'lazy'"
  />
</template>
