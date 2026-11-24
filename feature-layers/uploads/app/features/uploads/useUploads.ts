import { requestKey } from '../../../../../app/utils/request-key';
import { shallowRef, onScopeDispose } from 'vue';
import { normalizeApiError } from '../../../../../app/api/errors';
import type { createUploadsApi } from './api';
import type { UploadMetadata, UploadPolicy, UploadProgress } from './types';
import { validateUploads } from './utils';
export interface UploadItem {
  key: string;
  file: File;
  status: 'queued' | 'uploading' | 'complete' | 'failed' | 'cancelled';
  progress: number;
  uploadId?: string;
  result?: UploadMetadata;
  error?: string;
}
export function useUploads(
  api: ReturnType<typeof createUploadsApi>,
  policy: UploadPolicy,
  transfer: (
    path: string,
    file: File,
    signal: AbortSignal,
    progress: (value: UploadProgress) => void,
  ) => Promise<void>,
) {
  const items = shallowRef<UploadItem[]>([]);
  const controllers = new Map<string, AbortController>();
  const update = (key: string, changes: Partial<UploadItem>) => {
    items.value = items.value.map((item) => (item.key === key ? { ...item, ...changes } : item));
  };
  function add(files: File[]) {
    const errors = validateUploads([...items.value.map((item) => item.file), ...files], policy);
    if (errors.length) return errors;
    items.value = [
      ...items.value,
      ...files.map((file) => ({
        key: requestKey(),
        file,
        status: 'queued' as const,
        progress: 0,
      })),
    ];
    return [];
  }
  async function start(key: string) {
    const item = items.value.find((value) => value.key === key);
    if (!item || controllers.has(key) || item.status === 'complete') return;
    const controller = new AbortController();
    controllers.set(key, controller);
    const options = { signal: controller.signal, idempotencyKey: key };
    update(key, { status: 'uploading', progress: 0, error: undefined });
    try {
      const session = await api.initialize(
        { name: item.file.name, size: item.file.size, mimeType: item.file.type, temporary: true },
        options,
      );
      update(key, { uploadId: session.id });
      await transfer(session.contentPath, item.file, controller.signal, (value) =>
        update(key, { progress: value.percent }),
      );
      const result = await api.complete(session.id, options);
      if (!controller.signal.aborted)
        update(
          key,
          result.status === 'ready'
            ? { result, status: 'complete', progress: 100 }
            : {
                result,
                status: 'failed',
                progress: 100,
                error: 'The file was rejected by upload inspection.',
              },
        );
    } catch (cause) {
      const error = normalizeApiError(cause, controller.signal);
      update(key, {
        status: error.kind === 'cancelled' ? 'cancelled' : 'failed',
        error: error.message,
      });
    } finally {
      controllers.delete(key);
    }
  }
  function cancel(key: string) {
    controllers.get(key)?.abort();
    update(key, { status: 'cancelled' });
  }
  async function remove(key: string) {
    const item = items.value.find((value) => value.key === key);
    if (!item) return;
    controllers.get(key)?.abort();
    const uploadId = item.result?.id ?? item.uploadId;
    if (uploadId) await api.remove(uploadId, { idempotencyKey: `${key}_remove` });
    items.value = items.value.filter((value) => value.key !== key);
  }
  onScopeDispose(() => controllers.forEach((controller) => controller.abort()));
  return { items, add, start, cancel, remove, retry: start };
}
