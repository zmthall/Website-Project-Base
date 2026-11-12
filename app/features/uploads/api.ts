// TODO [UPLOAD-01]: Implement initialize/content/complete/status/delete endpoints with byte inspection, quotas, owner checks, quarantine/scanning, expiring downloads and abandoned-object cleanup. See docs/integration-audit.md.
import type { ApiClient } from '../../api/types';
import type { MutationOptions } from '../_shared/types';
import { featureClient, mutation, resourceID } from '../_shared/transport';
import type { UploadMetadata, UploadSession, UploadRequest } from './types';
export function createUploadsApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    initialize: (body: UploadRequest, options: MutationOptions) =>
      api<UploadSession>('/uploads', { method: 'POST', auth: true, body, ...mutation(options) }),
    complete: (id: string, options: MutationOptions) =>
      api<UploadMetadata>(`/uploads/${resourceID(id)}/complete`, {
        method: 'POST',
        auth: true,
        ...mutation(options),
      }),
    remove: (id: string, options: MutationOptions) =>
      api<undefined>(`/uploads/${resourceID(id)}`, {
        method: 'DELETE',
        auth: true,
        ...mutation(options),
      }),
    status: (id: string, signal?: AbortSignal) =>
      api<UploadMetadata>(`/uploads/${resourceID(id)}`, { auth: true, signal }),
  };
}
