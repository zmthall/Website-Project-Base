<script setup lang="ts">
import type { ResolvedNavigationItem } from '../../utils/navigation';
defineProps<{ items: ResolvedNavigationItem[] }>();
defineEmits<{ navigate: [] }>();
</script>
<template>
  <ul class="stack">
    <li v-for="item in items" :key="item.label">
      <BaseLink
        v-if="item.action"
        :action="item.action"
        :aria-current="item.exactActive ? 'page' : undefined"
        @click="$emit('navigate')"
      >
        {{ item.label }}
      </BaseLink>
      <details v-if="item.children.length">
        <summary>{{ item.action ? 'More in ' + item.label : item.label }}</summary>
        <NavigationDynamicMobileNav
          :items="item.children"
          style="padding: 1rem"
          @navigate="$emit('navigate')"
        />
      </details>
    </li>
  </ul>
</template>
