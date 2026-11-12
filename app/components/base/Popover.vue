<script setup lang="ts">
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverClose } from 'reka-ui';
withDefaults(defineProps<{ label?: string }>(), { label: 'More information' });
</script>
<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <BaseButton variant="outline">{{ label }}</BaseButton>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent class="popover" :side-offset="8">
        <slot />
        <PopoverClose as-child><BaseButton variant="text">Close</BaseButton></PopoverClose>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
