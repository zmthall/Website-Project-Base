<script setup lang="ts">
import type { ContentListItem } from '../../types/content';
defineProps<{ items: (string | ContentListItem)[]; ordered?: boolean }>();
</script>
<template>
  <component
    :is="ordered ? 'ol' : 'ul'"
    class="stack"
    :style="{ listStyle: ordered ? 'decimal' : 'disc', paddingLeft: '1.25rem' }"
  >
    <li v-for="(item, index) in items" :key="index">
      <span v-if="typeof item === 'string'">{{ item }}</span>
      <template v-else>
        <BaseIcon v-if="item.icon" :name="item.icon" style="display: inline" />
        {{ item.text }}
        <ContentList v-if="item.children" :items="item.children" />
      </template>
    </li>
  </component>
</template>
