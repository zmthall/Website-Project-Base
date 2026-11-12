<script setup lang="ts">
import type { VideoMedia } from '../../../shared/types/media';
import { safeMediaURL } from '../../utils/media';
defineProps<{
  video: VideoMedia;
  title?: string;
  tracks?: { src: string; language: string; label: string }[];
  transcript?: string;
}>();
const image = useImage();
const allowMotion = ref(false);
onMounted(() => (allowMotion.value = !matchMedia('(prefers-reduced-motion: reduce)').matches));
</script>
<template>
  <figure class="stack">
    <video
      controls
      :aria-label="title ?? 'Video'"
      :poster="video.poster ? image(video.poster.src, { width: 1200 }) : undefined"
      :autoplay="video.autoplay && video.muted && allowMotion"
      :muted="video.muted"
      :loop="video.loop"
      :preload="video.preload ?? 'none'"
      playsinline
      style="width: 100%; aspect-ratio: 16/9"
    >
      <source
        v-for="source in video.sources.filter((s) => safeMediaURL(s.src))"
        :key="source.src"
        :src="source.src"
        :type="source.type"
      />
      <track
        v-for="track in tracks"
        :key="track.src"
        kind="captions"
        :src="track.src"
        :srclang="track.language"
        :label="track.label"
      />
      Your browser does not support video.
    </video>
    <figcaption v-if="transcript">{{ transcript }}</figcaption>
  </figure>
</template>
