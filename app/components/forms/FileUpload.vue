<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    accept?: string;
    multiple?: boolean;
    maxBytes?: number;
    label?: string;
    localOnly?: boolean;
  }>(),
  { maxBytes: 5 * 1024 * 1024, label: 'Choose files', localOnly: true },
);
const model = defineModel<File[]>({ default: () => [] });
const error = ref('');
const input = ref<HTMLInputElement>();
const id = useId();
function accepts(file: File) {
  if (!props.accept) return true;
  return props.accept
    .toLowerCase()
    .split(',')
    .some((part) => {
      const type = part.trim();
      return type.startsWith('.')
        ? file.name.toLowerCase().endsWith(type)
        : type.endsWith('/*')
          ? file.type.startsWith(type.slice(0, -1))
          : file.type === type;
    });
}
function change(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files ?? []);
  error.value = files.some((file) => file.size > props.maxBytes)
    ? 'A file exceeds the size limit.'
    : files.some((file) => !accepts(file))
      ? 'A file has an unsupported type.'
      : '';
  model.value = error.value ? [] : files;
  target.value = '';
}
function remove(index: number) {
  model.value = model.value.filter((_, i) => i !== index);
  input.value?.focus();
}
</script>
<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      ref="input"
      type="file"
      class="input"
      :accept="accept"
      :multiple="multiple"
      :aria-describedby="`${id}-help`"
      :aria-invalid="!!error"
      @change="change"
    />
    <p :id="`${id}-help`" class="help">
      Up to {{ Math.round(maxBytes / 1024 / 1024) }} MB per file.
      <span v-if="localOnly">Files remain in your browser in this demo.</span>
    </p>
    <p v-if="error" class="error-text" role="alert">{{ error }}</p>
    <ul aria-live="polite">
      <li v-for="(file, index) in model" :key="`${file.name}-${index}`" class="cluster">
        <span>{{ file.name }}</span>
        <BaseButton
          variant="ghost"
          size="sm"
          :aria-label="`Remove ${file.name}`"
          @click="remove(index)"
        >
          Remove
        </BaseButton>
      </li>
    </ul>
  </div>
</template>
