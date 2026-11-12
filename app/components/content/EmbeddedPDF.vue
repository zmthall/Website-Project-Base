<script setup lang="ts">
import { safeMediaURL } from '../../utils/media';
defineProps<{ src: string; title: string; description?: string }>();
const loaded = ref(false);
</script>
<template>
  <div v-if="safeMediaURL(src)" class="stack">
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <div class="cluster">
      <BaseButton variant="outline" @click="loaded = !loaded">
        {{ loaded ? 'Hide' : 'Preview' }} document
      </BaseButton>
      <BaseLink :action="{ type: 'download', href: src, label: `Download ${title} (PDF)` }" />
    </div>
    <iframe
      v-if="loaded"
      :src="src"
      :title="title"
      sandbox="allow-same-origin"
      loading="lazy"
      style="width: 100%; height: 32rem; border: 1px solid var(--line)"
    />
  </div>
</template>
