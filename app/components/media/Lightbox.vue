<script setup lang="ts">
import type { ImageMedia } from '../../../shared/types/image';
const props = defineProps<{ images: ImageMedia[] }>();
const open = defineModel<boolean>('open', { default: false });
const index = defineModel<number>('index', { default: 0 });
function navigate(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    index.value = Math.max(
      0,
      Math.min(props.images.length - 1, index.value + (event.key === 'ArrowLeft' ? -1 : 1)),
    );
  }
}
</script>
<template>
  <BaseModal
    v-model:open="open"
    @keydown="navigate"
    :title="images[index]?.caption ?? 'Image viewer'"
    :description="images[index]?.alt ?? 'View image'"
  >
    <div>
      <MediaAppImage
        v-if="images[index]"
        :image="{ ...images[index]!, sizes: '90vw', loading: 'eager' }"
      />
      <div v-if="images.length > 1" class="cluster" style="margin-top: 1rem">
        <BaseButton variant="outline" :disabled="index === 0" @click="index--">Previous</BaseButton>
        <span aria-live="polite">{{ index + 1 }} / {{ images.length }}</span>
        <BaseButton variant="outline" :disabled="index === images.length - 1" @click="index++">
          Next
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
