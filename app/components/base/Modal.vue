<script setup lang="ts">
// TODO [A11Y-01]: Complete keyboard-only, real Safari/iOS and screen-reader tests for dialogs/forms/calendar/customer actions, including loading/error/focus transitions and narrow layouts. See docs/integration-audit.md.

import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';
withDefaults(
  defineProps<{ title?: string; description?: string; drawer?: boolean; wide?: boolean }>(),
  {
    title: 'Details',
    description: 'Review the information below.',
  },
);
const emit = defineEmits<{ keydown: [event: KeyboardEvent] }>();
const open = defineModel<boolean>('open', { default: false });
let opener: HTMLElement | null = null;
watch(
  open,
  (value) => {
    if (value && import.meta.client) opener = document.activeElement as HTMLElement;
  },
  { flush: 'sync' },
);
function restoreFocus(event: Event) {
  if (opener?.isConnected) {
    event.preventDefault();
    opener.focus();
  }
}
</script>
<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent
        class="dialog"
        :class="{ drawer, 'dialog-wide': wide }"
        @close-auto-focus="restoreFocus"
        @keydown="emit('keydown', $event)"
      >
        <DialogClose as-child>
          <BaseButton class="dialog-close" variant="ghost" aria-label="Close dialog">
            <BaseIcon name="close" />
          </BaseButton>
        </DialogClose>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription class="muted" style="margin-block: 1rem">
          {{ description }}
        </DialogDescription>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog-wide {
  width: min(96vw, 90rem);
  max-width: 90rem;
}
</style>
