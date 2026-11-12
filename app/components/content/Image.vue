<script setup lang="ts">
import type { ImageMedia } from '../../../shared/types/image';
defineProps<{ image: ImageMedia }>();
</script>
<template>
  <figure>
    <MediaAppImage :image="image" />
    <figcaption v-if="image.caption || image.attribution" class="help">
      {{ image.caption }}
      <BaseLink
        v-if="image.attribution?.href"
        :action="{ type: 'external', href: image.attribution.href, label: image.attribution.text }"
      />
      <span v-else>{{ image.attribution?.text }}</span>
    </figcaption>
  </figure>
</template>
