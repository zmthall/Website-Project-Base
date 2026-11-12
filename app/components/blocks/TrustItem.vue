<script setup lang="ts">
import type { TrustItem } from '../../types/blocks';
defineProps<{ item: TrustItem; compact?: boolean }>();
</script>
<template>
  <div class="stack">
    <MediaAppImage
      v-if="item.image"
      :image="{ ...item.image, sizes: '160px' }"
      style="max-width: 10rem; object-fit: contain"
    />
    <BaseIcon v-if="item.icon" :name="item.icon" />
    <strong>{{ item.name }}</strong>
    <p v-if="item.description && !compact" class="muted">{{ item.description }}</p>
    <BaseLink v-if="item.action" :action="item.action" />
  </div>
</template>
