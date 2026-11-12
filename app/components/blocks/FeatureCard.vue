<script setup lang="ts">
import type { Feature } from '../../types/blocks';
defineProps<{ feature: Feature }>();
</script>
<template>
  <BaseCard as="article">
    <MediaAppImage v-if="feature.image" :image="feature.image" class="media-frame" />
    <ContentIcon v-else-if="feature.icon" :name="feature.icon" />
    <h3>{{ feature.title }}</h3>
    <p v-if="feature.description" class="muted">{{ feature.description }}</p>
    <BaseLink v-if="feature.action" :action="feature.action" />
  </BaseCard>
</template>
