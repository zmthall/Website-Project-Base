<script setup lang="ts">
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'reka-ui';
withDefaults(
  defineProps<{ label?: string; items: { label: string; value: string; disabled?: boolean }[] }>(),
  { label: 'Options' },
);
defineEmits<{ select: [value: string] }>();
</script>
<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <BaseButton variant="outline">
        {{ label }}
        <BaseIcon name="chevron-down" />
      </BaseButton>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent class="popover" :side-offset="8">
        <DropdownMenuItem
          v-for="item in items"
          :key="item.value"
          class="menu-item"
          :disabled="item.disabled"
          @select="$emit('select', item.value)"
        >
          {{ item.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
