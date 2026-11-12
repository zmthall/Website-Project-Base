<script setup lang="ts">
import type { ImageMedia } from '../../../shared/types/image';
defineProps<{ before: ImageMedia; after: ImageMedia }>();
const value = ref(50);
</script>
<template>
  <figure class="stack">
    <div style="position: relative; aspect-ratio: 4/3; overflow: hidden">
      <MediaAppImage :image="after" style="position: absolute; width: 100%; height: 100%" />
      <MediaAppImage
        :image="before"
        :style="{
          position: 'absolute',
          width: '100%',
          height: '100%',
          clipPath: `inset(0 ${100 - value}% 0 0)`,
        }"
      />
    </div>
    <FormsRange v-model="value" label="Before / after comparison" />
    <figcaption class="help">Before: {{ before.alt }}. After: {{ after.alt }}.</figcaption>
  </figure>
</template>
