<script setup lang="ts">
// TODO [MEDIA-01]: Review provider allowlists, CSP, consent revocation and fallback behavior before enabling real map/video integrations; keep tracking inactive until permitted. See docs/integration-audit.md.

import type { EmbeddedVideoMedia } from '../../../shared/types/media';
const props = defineProps<{ video: EmbeddedVideoMedia; transcript?: string }>();
const loaded = ref(false);
const source = computed(() =>
  props.video.provider === 'youtube' && /^[\w-]{11}$/.test(props.video.videoId)
    ? `https://www.youtube-nocookie.com/embed/${props.video.videoId}`
    : props.video.provider === 'vimeo' && /^\d+$/.test(props.video.videoId)
      ? `https://player.vimeo.com/video/${props.video.videoId}?dnt=1`
      : undefined,
);
</script>
<template>
  <div class="stack">
    <iframe
      v-if="loaded && source"
      :src="source"
      :title="video.title"
      loading="lazy"
      allow="fullscreen; picture-in-picture"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      style="width: 100%; aspect-ratio: 16/9; border: 0"
    />
    <div v-else class="card stack">
      <MediaAppImage v-if="video.poster" :image="video.poster" />
      <p>{{ video.title }}</p>
      <p class="help">Loading this video connects to {{ video.provider }}.</p>
      <BaseButton :disabled="!source" @click="loaded = true">Load video</BaseButton>
    </div>
    <p v-if="transcript">{{ transcript }}</p>
  </div>
</template>
