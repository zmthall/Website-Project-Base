<script setup lang="ts">
import type { Stat } from '../../types/blocks';
const props = defineProps<{ stat: Stat; animate?: boolean }>();
const config = useWebsiteUI();
const root = ref<HTMLElement>();
const display = ref<string | number>(props.stat.value);
let observer: IntersectionObserver | undefined;
let frame = 0;
watch(
  () => props.stat.value,
  (value) => {
    cancelAnimationFrame(frame);
    display.value = value;
  },
);
onMounted(() => {
  if (
    !props.animate ||
    !config.value.motion ||
    typeof props.stat.value !== 'number' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return;
  observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer?.disconnect();
    const target = Number(props.stat.value);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 700, 1);
      display.value = Math.round(target * (1 - (1 - progress) ** 3));
      if (progress < 1 && config.value.motion) frame = requestAnimationFrame(tick);
      else display.value = props.stat.value;
    };
    frame = requestAnimationFrame(tick);
  });
  if (root.value) observer.observe(root.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
});
</script>
<template>
  <div ref="root" class="stack">
    <BaseIcon v-if="stat.icon" :name="stat.icon" />
    <p
      class="stat"
      :aria-label="stat.accessibleLabel ?? `${stat.prefix ?? ''}${stat.value}${stat.suffix ?? ''}`"
    >
      <span aria-hidden="true">{{ stat.prefix }}{{ display }}{{ stat.suffix }}</span>
    </p>
    <h3>{{ stat.label }}</h3>
    <p v-if="stat.description" class="muted">{{ stat.description }}</p>
  </div>
</template>
