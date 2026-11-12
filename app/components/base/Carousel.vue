<script setup lang="ts">
const props = defineProps<{
  items: { id: string; title?: string; description?: string }[];
  label?: string;
}>();
const index = ref(0);
watch(
  () => props.items.length,
  () => (index.value = 0),
);
function move(delta: number) {
  index.value = (index.value + delta + props.items.length) % props.items.length;
}
</script>
<template>
  <section
    role="region"
    aria-roledescription="carousel"
    :aria-label="label ?? 'Gallery'"
    class="stack"
  >
    <div v-if="items[index]" class="carousel-slide" aria-live="polite">
      <slot :item="items[index]!" :index="index">
        <h3>{{ items[index]?.title }}</h3>
        <p>{{ items[index]?.description }}</p>
      </slot>
    </div>
    <BaseEmptyState v-else />
    <div v-if="items.length > 1" class="cluster">
      <BaseButton variant="outline" aria-label="Previous slide" @click="move(-1)">
        <BaseIcon name="arrow-left" />
      </BaseButton>
      <span>{{ index + 1 }} / {{ items.length }}</span>
      <BaseButton variant="outline" aria-label="Next slide" @click="move(1)">
        <BaseIcon />
      </BaseButton>
    </div>
  </section>
</template>
