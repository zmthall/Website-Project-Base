<script setup lang="ts">
import type { ProcessStep } from '../../types/blocks';
defineProps<{ step: ProcessStep }>();
</script>
<template>
  <div class="stack">
    <span v-if="step.number" class="eyebrow">Step {{ String(step.number).padStart(2, '0') }}</span>
    <MediaAppImage v-if="step.image" :image="step.image" />
    <BaseIcon v-if="step.icon" :name="step.icon" />
    <h3>{{ step.title }}</h3>
    <p class="muted">{{ step.description }}</p>
  </div>
</template>
