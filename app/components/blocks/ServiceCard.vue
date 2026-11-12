<script setup lang="ts">
import type { Service } from '../../../shared/types/service';
defineProps<{ service: Service }>();
</script>
<template>
  <BaseCard as="article">
    <MediaAppImage v-if="service.image" :image="service.image" class="media-frame" />
    <ContentIcon v-else-if="service.icon" :name="service.icon" />
    <BaseBadge v-if="service.featured">Featured</BaseBadge>
    <h3>{{ service.name }}</h3>
    <p class="muted">{{ service.summary }}</p>
    <ContentCTA v-if="service.actions?.length" :actions="service.actions" />
    <NuxtLink v-else :to="`/services/${encodeURIComponent(service.slug)}`">
      Explore {{ service.name }} →
    </NuxtLink>
  </BaseCard>
</template>
