<script setup lang="ts">
import type { ArticleAuthor } from '../../../shared/types/article';
defineProps<{ author: ArticleAuthor; biography?: string }>();
</script>
<template>
  <div class="cluster">
    <MediaAppImage
      v-if="author.image"
      :image="{ ...author.image, width: 48, height: 48, sizes: '48px' }"
      class="avatar"
    />
    <BaseAvatar v-else :name="author.name" />
    <div>
      <NuxtLink v-if="author.slug" :to="`/authors/${encodeURIComponent(author.slug)}`">
        {{ author.name }}
      </NuxtLink>
      <span v-else>{{ author.name }}</span>
      <p v-if="biography" class="help">{{ biography }}</p>
    </div>
  </div>
</template>
