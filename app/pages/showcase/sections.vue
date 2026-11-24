<script setup lang="ts">
import { sectionRegistry } from '../../theme/sections';
import { demoSection } from '../../data/demo';
import { contactForm } from '../../../feature-layers/contact';
const selected = ref('hero-split');
const config = useWebsiteUI();
const status = ref('');
const entry = computed(() => sectionRegistry[selected.value]);
const preview = computed(() => ({
  ...demoSection,
  id: 'section-preview',
  headingLevel: 2 as const,
  video: {
    kind: 'video-embed' as const,
    provider: 'youtube' as const,
    videoId: 'aqz-KE-bpKQ',
    title: 'Sample video: Big Buck Bunny',
    poster: demoSection.image,
  },
  form:
    entry.value?.family === 'newsletter'
      ? {
          ...contactForm,
          id: 'newsletter',
          title: 'Stay in the loop',
          fields: contactForm.fields.filter((f) => f.name === 'email'),
        }
      : contactForm,
}));
useSEO({ title: 'Section variants', robots: { index: false, follow: false } });
function apply() {
  if (!entry.value) return;
  config.value.sections[entry.value.family] = { enabled: true, variant: entry.value.variant };
  status.value = 'Applied to this preview session. Open the business demo to see it.';
}
</script>
<template>
  <div>
    <div class="container section" style="padding-bottom: 2rem">
      <NavigationBreadCrumbs
        :items="[{ label: 'Showcase', to: '/showcase' }, { label: 'Section variants' }]"
      />
      <h1 style="margin-block: 1rem">A layout for every story.</h1>
      <p class="muted">
        Every section family shares typed content and the active theme. Choose a variant to preview
        it.
      </p>
      <div class="grid grid-2" style="margin-top: 2rem">
        <label class="field">
          Section variant
          <select v-model="selected" class="input">
            <option v-for="(item, key) in sectionRegistry" :key="key" :value="key">
              {{ item.label }}
            </option>
          </select>
        </label>
        <div class="cluster">
          <BaseButton @click="apply">Use this variant</BaseButton>
          <NuxtLink to="/" class="btn" data-variant="outline">View demo</NuxtLink>
        </div>
      </div>
      <p class="help" role="status">{{ status }}</p>
      <details style="margin-top: 1rem">
        <summary>Homepage section visibility</summary>
        <div class="cluster" style="margin-top: 1rem">
          <FormsSwitch
            v-for="(setting, key) in config.sections"
            :key="key"
            v-model="setting.enabled"
            :label="String(key)"
          />
        </div>
      </details>
    </div>
    <div class="surface" style="padding: 1rem">
      <p class="container catalog-label">{{ entry?.label }} · illustrative content</p>
      <component
        :is="entry.component"
        v-if="entry"
        :key="selected"
        :data="preview"
        @submit="status = 'Form validated locally. Nothing was sent.'"
      />
    </div>
  </div>
</template>
