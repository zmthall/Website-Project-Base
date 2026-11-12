<script setup lang="ts">
import type { ContentBlock } from '../../types/content';
defineProps<{ content?: string; blocks?: ContentBlock[] }>();
</script>
<template>
  <ContentRichText :content="content" :blocks="blocks"><slot /></ContentRichText>
</template>
