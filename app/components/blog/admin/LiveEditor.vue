<script setup lang="ts">
// TODO [BLOG-01]: Add revisions/restore, author permissions, image upload integration and cache/index invalidation; fuzz the MDC/prose renderer against hostile and oversized content. See docs/integration-audit.md.

import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import type { MDCParserResult } from '@nuxtjs/mdc';
const model = defineModel<string>({ default: '' });
const props = defineProps<{ disabled?: boolean }>();
const editorId = useId();
const editorControl = ref<{ element?: HTMLTextAreaElement }>();
const editor = computed(() => editorControl.value?.element);
const preview = ref<HTMLElement>();
const parsed = shallowRef<MDCParserResult>();
const error = ref('');
const sync = ref(true);
let timer: ReturnType<typeof setTimeout> | undefined;
let revision = 0;
let frame = 0;
let syncing = false;
async function render() {
  const current = ++revision;
  try {
    const result = await parseMarkdown(model.value);
    if (current === revision) {
      parsed.value = result;
      error.value = '';
      await nextTick();
      if (current === revision) scroll('editor');
    }
  } catch {
    if (current === revision) error.value = 'Unable to preview this Markdown. Check its syntax.';
  }
}
watch(
  model,
  () => {
    revision++;
    clearTimeout(timer);
    timer = setTimeout(render, 180);
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  revision++;
  clearTimeout(timer);
  cancelAnimationFrame(frame);
});
function scroll(source: 'editor' | 'preview') {
  if (!sync.value || syncing || !editor.value || !preview.value) return;
  const from = source === 'editor' ? editor.value : preview.value;
  const to = source === 'editor' ? preview.value : editor.value;
  const range = from.scrollHeight - from.clientHeight;
  syncing = true;
  to.scrollTop = range > 0 ? (from.scrollTop / range) * (to.scrollHeight - to.clientHeight) : 0;
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    syncing = false;
  });
}
const formatting = [
  ...[1, 2, 3, 4].map((level) => ({
    label: `H${level}`,
    before: `${'#'.repeat(level)} `,
    after: '',
    placeholder: 'Heading',
  })),
  { label: 'Bold', before: '**', after: '**', placeholder: 'Bold text' },
  { label: 'Italic', before: '*', after: '*', placeholder: 'Italic text' },
  { label: 'List', before: '- ', after: '', placeholder: 'List item' },
  { label: 'Numbered list', before: '1. ', after: '', placeholder: 'List item' },
  { label: 'Quote', before: '> ', after: '', placeholder: 'Quotation' },
  { label: 'Link', before: '[', after: '](https://example.com)', placeholder: 'Link text' },
  {
    label: 'Image',
    before: '![',
    after: '](/images/example.jpg)',
    placeholder: 'Image description',
  },
  { label: 'Inline code', before: '`', after: '`', placeholder: 'code' },
  { label: 'Code block', before: '\n```\n', after: '\n```\n', placeholder: 'Code here' },
  {
    label: 'Table',
    before: '\n| Column | Column |\n| --- | --- |\n',
    after: '\n',
    placeholder: '| Value | Value |',
  },
  { label: 'Divider', before: '\n\n---\n\n', after: '', placeholder: '' },
];
const proseBlocks = [
  {
    label: 'Callout',
    before: '\n::post-callout{title="Note"}\n',
    after: '\n::\n',
    placeholder: 'Important information.',
  },
  {
    label: 'At a glance',
    before: '\n::post-at-a-glance\n',
    after: '\n::\n',
    placeholder: '- Key takeaway',
  },
  {
    label: 'CTA tile',
    before: '\n::post-cta-tile{to="/contact" title="Get in touch"}\n',
    after: '\n::\n',
    placeholder: 'Contact our team',
  },
  {
    label: 'Centered action',
    before: '\n::centered-action{to="/contact"}\n',
    after: '\n::\n',
    placeholder: 'Contact our team',
  },
  {
    label: 'References',
    before: '\n::post-references\n',
    after: '\n::\n',
    placeholder: '- [Source](https://example.com)',
  },
  {
    label: 'Centered layout',
    before: '\n::center-layout-flex\n',
    after: '\n::\n',
    placeholder: 'Centered content',
  },
  { label: 'Phone number', before: '\n:phone-number\n', after: '', placeholder: '' },
];
function insert(before: string, after = '', placeholder = '') {
  const input = editor.value;
  if (!input || props.disabled) return;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const selected = model.value.slice(start, end) || placeholder;
  model.value = model.value.slice(0, start) + before + selected + after + model.value.slice(end);
  nextTick(() => {
    input.focus();
    input.setSelectionRange(start + before.length, start + before.length + selected.length);
  });
}
</script>
<template>
  <section class="live-markdown stack" aria-label="Markdown editor and live preview">
    <div class="cluster markdown-toolbar" role="group" aria-label="Markdown formatting">
      <BaseButton
        v-for="item in formatting"
        :key="item.label"
        type="button"
        variant="outline"
        :disabled="disabled"
        @click="insert(item.before, item.after, item.placeholder)"
      >
        {{ item.label }}
      </BaseButton>
      <FormsCheckbox v-model="sync" label="Sync scrolling" :disabled="disabled" />
    </div>
    <div class="cluster markdown-toolbar" role="group" aria-label="Custom prose blocks">
      <span class="muted">Prose blocks</span>
      <BaseButton
        v-for="item in proseBlocks"
        :key="item.label"
        type="button"
        variant="outline"
        :disabled="disabled"
        @click="insert(item.before, item.after, item.placeholder)"
      >
        {{ item.label }}
      </BaseButton>
    </div>
    <div class="markdown-panes">
      <FormsField :id="`markdown-${editorId}`" label="Markdown content" required>
        <FormsTextarea
          :id="`markdown-${editorId}`"
          ref="editorControl"
          v-model="model"
          :disabled="disabled"
          required
          maxlength="100000"
          spellcheck="false"
          @scroll="scroll('editor')"
        />
      </FormsField>
      <div class="stack">
        <h3>Live page preview</h3>
        <div
          ref="preview"
          class="markdown-preview"
          role="region"
          aria-label="Live page preview"
          tabindex="0"
          @scroll="scroll('preview')"
        >
          <p v-if="error" role="alert">{{ error }}</p>
          <MDCRenderer
            v-if="parsed"
            :body="parsed.body"
            :data="parsed.data"
            class="markdown-body"
          />
          <p v-else class="muted">Start writing to preview your post.</p>
        </div>
      </div>
    </div>
    <p class="muted">
      Preview updates as you type. Custom blocks: post-at-a-glance, post-callout, post-cta-tile,
      post-references, centered-action, center-layout-flex, phone-number.
    </p>
  </section>
</template>
<style scoped>
.markdown-panes {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}
.markdown-panes > div {
  min-width: 0;
}
.markdown-panes :deep(textarea),
.markdown-preview {
  height: 500px;
  overflow: auto;
  resize: vertical;
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius);
  color: var(--ink);
}
.markdown-panes :deep(textarea) {
  font-family: monospace;
  line-height: 1.7;
}
.markdown-preview {
  border: 1px solid var(--line);
  background: var(--panel);
}
.markdown-toolbar {
  flex-wrap: wrap;
}
@media (max-width: 800px) {
  .markdown-panes {
    grid-template-columns: 1fr;
  }
  .markdown-panes :deep(textarea),
  .markdown-preview {
    height: 350px;
  }
}
</style>
