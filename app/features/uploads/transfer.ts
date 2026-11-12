// TODO [UPLOAD-01]: Implement initialize/content/complete/status/delete endpoints with byte inspection, quotas, owner checks, quarantine/scanning, expiring downloads and abandoned-object cleanup. See docs/integration-audit.md.
import { ApiError } from '../../api/errors';
import type { UploadProgress } from './types';
/** Backend-proxied uploads. CSRF protection and session cookies belong to the configured backend. */
export function uploadContent(
  path: string,
  file: File,
  options: {
    signal: AbortSignal;
    headers: Record<string, string>;
    onProgress: (progress: UploadProgress) => void;
  },
): Promise<void> {
  const url = new URL(path, window.location.origin);
  if (
    url.origin !== window.location.origin ||
    !url.pathname.startsWith('/api/uploads/') ||
    url.username ||
    url.password
  )
    return Promise.reject(new ApiError('validation', 400, 'invalid-upload-path'));
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const cleanup = () => options.signal.removeEventListener('abort', abort);
    xhr.open('PUT', url.href);
    xhr.timeout = 120000;
    Object.entries(options.headers).forEach(([name, value]) => xhr.setRequestHeader(name, value));
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (event) =>
      options.onProgress({
        loaded: event.loaded,
        total: event.total || file.size,
        percent: Math.min(100, Math.round((event.loaded / (event.total || file.size || 1)) * 100)),
      });
    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new ApiError(xhr.status === 403 ? 'authorization' : 'http', xhr.status));
    };
    xhr.onerror = () => {
      cleanup();
      reject(new ApiError('network'));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new ApiError('timeout'));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new ApiError('cancelled'));
    };
    options.signal.addEventListener('abort', abort, { once: true });
    if (options.signal.aborted) {
      cleanup();
      reject(new ApiError('cancelled'));
      return;
    }
    xhr.send(file);
  });
}
