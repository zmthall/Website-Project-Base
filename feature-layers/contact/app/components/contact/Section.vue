<script setup lang="ts">
import type { SectionData } from '../../../../../app/types/sections';

const props = defineProps<{ variant: string; data: SectionData }>();
const emit = defineEmits<{
  submit: [values: Record<string, import('../../../../../app/types/forms').FormValue>];
}>();
const layout = computed(() =>
  props.variant === 'withmap' ? 'split' : props.variant === 'locations' ? 'grid' : props.variant,
);
const currentLocation = computed(() => props.data.locations?.[0]);
</script>
<template>
  <section
    :id="data.id"
    class="section"
    :style="data.columns ? { '--section-columns': data.columns } : undefined"
    :data-media-first="data.mediaFirst || undefined"
    data-family="contact"
    :data-variant="variant"
  >
    <div class="container">
      <div class="section-heading">
        <ContentEyebrow v-if="data.eyebrow">{{ data.eyebrow }}</ContentEyebrow>
        <component :is="`h${data.headingLevel ?? 2}`">{{ data.title }}</component>
        <p v-if="data.description">{{ data.description }}</p>
      </div>
      <SystemLoadingState v-if="data.loading" />
      <SystemErrorState v-else-if="data.error" :message="data.error" />
      <div v-else class="section-layout" :data-layout="layout">
        <div class="stack">
          <BusinessContactMethods />
          <template v-if="variant === 'locations'">
            <BlocksLocationCard
              v-for="location in data.locations"
              :key="location.id"
              :location="location"
            />
          </template>
          <BusinessMap
            v-if="variant === 'withmap' && currentLocation"
            :location="currentLocation"
          />
          <ContentCTA v-if="data.actions" :actions="data.actions" />
        </div>
        <FormsDynamicForm
          v-if="data.form && variant !== 'simple' && variant !== 'locations'"
          :schema="data.form"
          @submit="emit('submit', $event)"
        />
      </div>
      <slot />
    </div>
  </section>
</template>
