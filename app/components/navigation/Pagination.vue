<script setup lang="ts">
const props = defineProps<{ page: number; totalPages: number; queryKey?: string }>();
defineEmits<{ 'update:page': [value: number] }>();
const route = useRoute();
const pages = computed(() =>
  Array.from({ length: Math.max(0, props.totalPages) }, (_, i) => i + 1).filter(
    (i) => i === 1 || i === props.totalPages || Math.abs(i - props.page) <= 1,
  ),
);
</script>
<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
    <NuxtLink
      v-if="page > 1"
      :to="{ query: { ...route.query, [queryKey ?? 'page']: page - 1 } }"
      @click="$emit('update:page', page - 1)"
    >
      Previous
    </NuxtLink>
    <template v-for="(number, index) in pages" :key="number">
      <span v-if="index && number > pages[index - 1]! + 1" aria-hidden="true">…</span>
      <NuxtLink
        class="btn"
        :data-variant="page === number ? 'primary' : 'ghost'"
        :to="{ query: { ...route.query, [queryKey ?? 'page']: number } }"
        :aria-label="`Page ${number}`"
        :aria-current="page === number ? 'page' : undefined"
        @click="$emit('update:page', number)"
      >
        {{ number }}
      </NuxtLink>
    </template>
    <NuxtLink
      v-if="page < totalPages"
      :to="{ query: { ...route.query, [queryKey ?? 'page']: page + 1 } }"
      @click="$emit('update:page', page + 1)"
    >
      Next
    </NuxtLink>
  </nav>
</template>
