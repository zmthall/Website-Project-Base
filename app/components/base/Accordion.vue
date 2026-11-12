<script setup lang="ts">
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'reka-ui';
defineProps<{ items: { id: string; title: string; content: string }[]; multiple?: boolean }>();
</script>
<template>
  <AccordionRoot :type="multiple ? 'multiple' : 'single'" collapsible>
    <AccordionItem v-for="item in items" :key="item.id" :value="item.id" class="accordion-item">
      <AccordionHeader>
        <AccordionTrigger class="accordion-trigger">
          {{ item.title }}
          <BaseIcon name="plus" />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content">
        <slot :item="item">{{ item.content }}</slot>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
