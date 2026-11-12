<script setup lang="ts">
import { safeMediaURL } from '../../utils/media';
defineOptions({ inheritAttrs: false });
const props = defineProps<{ href?: string }>();
const attrs = useAttrs();
const safeHref = computed(() => {
  const href = String(props.href || '');
  return safeMediaURL(href) || /^#[^\s<>]*$/.test(href) || /^(mailto:|tel:)[^\s<>]+$/.test(href)
    ? href
    : undefined;
});
</script>
<template>
  <a
    v-if="safeHref"
    v-bind="attrs"
    :href="safeHref"
    rel="noopener noreferrer"
    class="post-prose-link"
  >
    <slot />
  </a>
  <span v-else><slot /></span>
</template>
