<script setup lang="ts">
defineProps<{ headings: { id: string; text: string; level: number }[] }>();
</script>
<template>
  <nav aria-label="Table of contents">
    <details open>
      <summary class="label">On this page</summary>
      <ol class="stack" style="margin-top: 1rem">
        <li
          v-for="heading in headings"
          :key="heading.id"
          :style="{ paddingLeft: `${Math.max(0, heading.level - 2)}rem` }"
        >
          <a :href="`#${heading.id}`">{{ heading.text }}</a>
        </li>
      </ol>
    </details>
  </nav>
</template>
