<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui';
defineProps<{ items: { value: string; label: string; content?: string; disabled?: boolean }[] }>();
const model = defineModel<string>();
</script>
<template>
  <TabsRoot v-model="model" :default-value="items[0]?.value">
    <TabsList class="tabs-list" aria-label="Content sections">
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="tab"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in items" :key="item.value" :value="item.value">
      <slot :name="item.value">{{ item.content }}</slot>
    </TabsContent>
  </TabsRoot>
</template>
