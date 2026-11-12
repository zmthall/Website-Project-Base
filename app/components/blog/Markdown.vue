<script setup lang="ts">
// TODO [BLOG-01]: Add revisions/restore, author permissions, image upload integration and cache/index invalidation; fuzz the MDC/prose renderer against hostile and oversized content. See docs/integration-audit.md.

import type { RenderedMarkdown } from '#shared/types/management';
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import type { TocLink } from '@nuxtjs/mdc';
const props = defineProps<{ rendered: RenderedMarkdown; showToc?: boolean }>();
const { data: parsed } = await useAsyncData(
  `markdown-${useId()}`,
  () => parseMarkdown(props.rendered.source),
  { watch: [() => props.rendered.source] },
);
function flatten(links: TocLink[]): TocLink[] {
  return links.flatMap((link) => [link, ...flatten(link.children || [])]);
}
const headings = computed(() => flatten(parsed.value?.toc?.links || []));
</script>
<template>
  <div class="stack">
    <nav v-if="showToc && headings.length" aria-label="On this page" class="markdown-toc stack">
      <h2>On this page</h2>
      <ul>
        <li
          v-for="heading in headings"
          :key="heading.id"
          :style="{ marginLeft: `${Math.max(0, heading.depth - 2)}rem` }"
        >
          <a :href="`#${heading.id}`">{{ heading.text }}</a>
        </li>
      </ul>
    </nav>
    <MDCRenderer v-if="parsed" :body="parsed.body" :data="parsed.data" class="markdown-body" />
  </div>
</template>
<style scoped>
.markdown-toc {
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
</style>
