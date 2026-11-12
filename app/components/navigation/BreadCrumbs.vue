<script setup lang="ts">
defineProps<{ items: { label: string; to?: string }[] }>();
</script>
<template>
  <nav aria-label="Breadcrumb">
    <ol class="cluster" style="font-size: 0.8rem">
      <li v-for="(item, index) in items" :key="index" class="cluster">
        <span v-if="index" aria-hidden="true">/</span>
        <NuxtLink v-if="item.to && index < items.length - 1" :to="item.to">
          {{ item.label }}
        </NuxtLink>
        <span v-else :aria-current="index === items.length - 1 ? 'page' : undefined">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
