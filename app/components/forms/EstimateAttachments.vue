<script setup lang="ts">
// TODO [EST-02]: Install the private upload API and owner/ready-state resolver before enabling attachments; handle scanning completion, omitted-file cleanup and request retention. See docs/integration-audit.md.

import { createUploadsApi } from '../../features/uploads/api';
import { useUploads } from '../../features/uploads/useUploads';
import { uploadContent } from '../../features/uploads/transfer';
import type { ApiClient } from '../../api/types';
const model = defineModel<string[]>({ default: () => [] });
const pending = defineModel<boolean>('pending', { default: false });
const files = ref<File[]>([]);
const error = ref('');
const api: ApiClient = async (path, options = {}) => {
  const session = await $fetch<{ csrfToken: string }>('/api/customer/auth/session');
  return $fetch('/api' + path, {
    method: options.method as 'GET' | 'POST' | 'DELETE',
    body: options.body as Record<string, unknown>,
    headers: { 'X-CSRF-Token': session.csrfToken },
    signal: options.signal,
  });
};
const uploads = useUploads(
  createUploadsApi(api),
  {
    maxBytes: 5 * 1024 * 1024,
    maxFiles: 5,
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  async (path, file, signal, onProgress) => {
    const session = await $fetch<{ csrfToken: string }>('/api/customer/auth/session');
    await uploadContent(path, file, {
      signal,
      headers: { 'X-CSRF-Token': session.csrfToken },
      onProgress,
    });
  },
);
watch(files, async (value) => {
  const problems = uploads.add(value);
  error.value = problems.join(' ');
  if (!problems.length)
    await Promise.all(
      uploads.items.value.filter((i) => i.status === 'queued').map((i) => uploads.start(i.key)),
    );
});
watch(
  uploads.items,
  (items) => {
    model.value = items
      .filter((i) => i.status === 'complete' && i.result?.status === 'ready')
      .map((i) => i.result!.id);
    pending.value = items.some((i) => i.status !== 'complete' || i.result?.status !== 'ready');
  },
  { immediate: true },
);
</script>
<template>
  <section class="stack">
    <h3>Optional project photos or documents</h3>
    <p class="muted">Only ready, privately owned uploads can be attached.</p>
    <FormsFileUpload
      :local-only="false"
      v-model="files"
      accept="image/jpeg,image/png,application/pdf"
      multiple
      label="Project attachments"
    />
    <p v-if="error" role="alert">{{ error }}</p>
    <ul aria-live="polite">
      <li v-for="item in uploads.items.value" :key="item.key">
        {{ item.file.name }} · {{ item.status }} · {{ item.progress }}%
        <span v-if="item.error">{{ item.error }}</span>
        <BaseButton
          v-if="item.status === 'failed' || item.status === 'cancelled'"
          variant="outline"
          @click="uploads.retry(item.key)"
        >
          Retry upload
        </BaseButton>
        <BaseButton
          v-if="item.status === 'uploading'"
          variant="outline"
          @click="uploads.cancel(item.key)"
        >
          Cancel upload
        </BaseButton>
        <BaseButton
          variant="outline"
          @click="
            uploads.cancel(item.key);
            uploads.items.value = uploads.items.value.filter((value) => value.key !== item.key);
          "
        >
          Omit attachment
        </BaseButton>
      </li>
    </ul>
  </section>
</template>
