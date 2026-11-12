<script setup lang="ts">
const dialog = ref(false),
  drawer = ref(false),
  toast = ref(false),
  chip = ref(true);
const message = ref('');
const variants = ['primary', 'secondary', 'outline', 'ghost', 'text', 'danger'] as const;
</script>
<template>
  <div class="stack">
    <h3>Buttons & links</h3>
    <div class="cluster">
      <BaseButton
        v-for="variant in variants"
        :key="variant"
        :variant="variant"
        @click="message = `${variant} button activated`"
      >
        {{ variant }}
      </BaseButton>
      <BaseButton disabled>Disabled</BaseButton>
      <BaseButton loading>Loading</BaseButton>
    </div>
    <div class="cluster">
      <BaseButton size="sm">Small</BaseButton>
      <BaseButton size="md">Medium</BaseButton>
      <BaseButton size="lg">Large</BaseButton>
      <BaseLink :action="{ type: 'route', to: '/', label: 'Internal link' }" />
      <BaseLink
        :action="{
          type: 'external',
          href: 'https://example.com',
          label: 'External link',
          target: '_blank',
        }"
      />
    </div>
    <p role="status" class="help">{{ message }}</p>
    <BaseDivider />
    <h3>Surfaces & feedback</h3>
    <div class="grid grid-2">
      <BaseCard>
        <h3>Lorem ipsum</h3>
        <p class="muted">A base card with a clear heading and supporting content.</p>
        <div class="cluster">
          <BaseBadge>Example badge</BaseBadge>
          <BaseChip v-if="chip" label="Removable chip" removable @remove="chip = false" />
          <BaseAvatar name="Lorem Ipsum" />
        </div>
        <BaseRating :value="4" :count="24" />
      </BaseCard>
      <div class="stack">
        <BaseAlert title="Information">Lorem ipsum dolor sit amet.</BaseAlert>
        <BaseAlert tone="success" title="Success">Your example is ready.</BaseAlert>
        <BaseAlert tone="danger" title="Error">Please check your input.</BaseAlert>
      </div>
    </div>
    <div class="grid grid-2">
      <BaseEmptyState />
      <div class="stack">
        <BaseProgress :value="65" label="Example progress" />
        <BaseSkeleton :lines="3" />
        <SystemLoadingState compact />
      </div>
    </div>
    <BaseDivider />
    <h3>Disclosure & overlays</h3>
    <div class="cluster">
      <BaseButton @click="dialog = true">Open dialog</BaseButton>
      <BaseButton variant="outline" @click="drawer = true">Open drawer</BaseButton>
      <BaseButton variant="outline" @click="toast = true">Show notification</BaseButton>
      <BaseDropdown
        :items="[
          { label: 'First action', value: 'first' },
          { label: 'Second action', value: 'second' },
          { label: 'Unavailable', value: 'disabled', disabled: true },
        ]"
        @select="message = `Selected ${$event}`"
      />
      <BasePopover label="Open popover">
        <p>Lorem ipsum dolor sit amet. Additional contextual information.</p>
      </BasePopover>
      <BaseTooltip text="More information about this control">
        <BaseButton variant="ghost" aria-label="Information"><BaseIcon name="info" /></BaseButton>
      </BaseTooltip>
    </div>
    <BaseModal
      v-model:open="dialog"
      title="Example dialog"
      description="Focus stays inside this dialog. Escape closes it."
    >
      <p>Lorem ipsum dolor sit amet.</p>
      <label class="field">
        Example input
        <input class="input" />
      </label>
    </BaseModal>
    <BaseDrawer
      v-model:open="drawer"
      title="Example drawer"
      description="A reusable panel for navigation and supporting content."
    >
      <p>Lorem ipsum dolor sit amet.</p>
    </BaseDrawer>
    <BaseToast
      v-model:open="toast"
      title="Example notification"
      description="Your action completed in this local demonstration."
    />
    <BaseAccordion
      :items="[
        {
          id: 'one',
          title: 'How does an accordion work?',
          content: 'Open a question to read its answer. Keyboard and touch controls are supported.',
        },
        {
          id: 'two',
          title: 'Can I customize its appearance?',
          content: 'Yes. The component inherits the active theme tokens.',
        },
      ]"
    />
    <BaseTabs
      :items="[
        { value: 'overview', label: 'Overview', content: 'Lorem ipsum dolor sit amet.' },
        { value: 'details', label: 'Details', content: 'Consectetur adipiscing elit.' },
        { value: 'disabled', label: 'Unavailable', disabled: true },
      ]"
    />
    <BaseCarousel
      :items="[
        { id: '1', title: 'First slide', description: 'Lorem ipsum dolor sit amet.' },
        { id: '2', title: 'Second slide', description: 'Consectetur adipiscing elit.' },
      ]"
    />
  </div>
</template>
