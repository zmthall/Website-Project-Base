<script setup lang="ts">
import { safeMediaURL } from '../../utils/media';
const props = defineProps<{ url: string; title: string }>();
const status = ref('');
async function copy() {
  try {
    await navigator.clipboard.writeText(props.url);
    status.value = 'Link copied.';
  } catch {
    status.value = 'Copy the link below.';
  }
}
async function share() {
  if (navigator.share) {
    try {
      await navigator.share({ title: props.title, url: props.url });
    } catch {
      status.value = 'Sharing cancelled.';
    }
  } else await copy();
}
</script>
<template>
  <div v-if="safeMediaURL(url)" class="stack">
    <div class="cluster">
      <BaseButton variant="outline" @click="share">Share article</BaseButton>
      <BaseButton variant="text" @click="copy">Copy link</BaseButton>
    </div>
    <p role="status" class="help">{{ status }}</p>
    <a v-if="status === 'Copy the link below.'" :href="url">{{ url }}</a>
  </div>
</template>
