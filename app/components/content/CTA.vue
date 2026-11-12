<script setup lang="ts">
import type { Action } from '../../../shared/types/action';
defineProps<{ actions: Action[]; centered?: boolean }>();
</script>
<template>
  <div
    v-if="actions.length"
    class="cluster"
    :style="centered ? { justifyContent: 'center' } : undefined"
  >
    <BaseLink
      v-for="(action, i) in actions"
      :key="i"
      :action="action"
      :button="action.intent !== 'text'"
    >
      {{ action.label }}
      <BaseIcon v-if="action.icon" :name="action.icon" />
    </BaseLink>
  </div>
</template>
