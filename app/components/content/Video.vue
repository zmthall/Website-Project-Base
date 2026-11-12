<script setup lang="ts">
import type { Video } from '../../../shared/types/media';
defineProps<{
  video: Video;
  transcript?: string;
  tracks?: { src: string; language: string; label: string }[];
}>();
</script>
<template>
  <MediaVideoEmbed v-if="video.kind === 'video-embed'" :video="video" :transcript="transcript" />
  <MediaAppVideo v-else :tracks="tracks" :video="video" :transcript="transcript" />
</template>
