<script setup lang="ts">
import type { ResolvedNavigationItem } from '../../utils/navigation';
defineProps<{ items: ResolvedNavigationItem[] }>();
</script>
<template>
  <ul class="cluster">
    <li v-for="item in items" :key="item.label">
      <div class="cluster">
        <BaseLink
          v-if="item.action"
          :action="item.action"
          :aria-current="item.exactActive ? 'page' : undefined"
        >
          {{ item.label }}
        </BaseLink>
        <details v-if="item.children.length" style="position: relative">
          <summary :aria-label="item.action ? `${item.label} submenu` : undefined">
            {{ item.action ? '' : item.label }}
            <BaseIcon v-if="item.action" name="chevron-down" :size="16" style="display: inline" />
          </summary>
          <div class="popover" style="position: absolute; min-width: 13rem">
            <NavigationDynamicMobileNav :items="item.children" />
          </div>
        </details>
      </div>
    </li>
  </ul>
</template>
