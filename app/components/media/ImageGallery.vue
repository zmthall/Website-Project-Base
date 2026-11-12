<script setup lang="ts">
import type { ImageMedia } from '../../../shared/types/image';
withDefaults(defineProps<{ images: ImageMedia[]; lightbox?: boolean; limit?: number }>(), {
  lightbox: true,
  limit: 12,
});
const open = ref(false);
const index = ref(0);
const expanded = ref(false);
</script>
<template>
  <div class="stack">
    <div class="grid grid-3">
      <figure
        v-for="(image, i) in images.slice(0, expanded ? images.length : limit)"
        :key="image.src"
      >
        <button
          v-if="lightbox"
          class="gallery-button"
          :aria-label="`Enlarge ${image.alt}`"
          @click="
            index = i;
            open = true;
          "
        >
          <MediaAppImage :image="image" />
        </button>
        <MediaAppImage v-else :image="image" />
        <figcaption v-if="image.caption" class="help">{{ image.caption }}</figcaption>
      </figure>
    </div>
    <BaseButton
      v-if="images.length > limit && !expanded"
      variant="outline"
      @click="expanded = true"
    >
      Show all images
    </BaseButton>
    <MediaLightbox v-model:open="open" v-model:index="index" :images="images" />
  </div>
</template>
