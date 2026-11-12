import type { ApiClient } from '../../api/types';
import type { MutationOptions, ListOptions, Page } from '../_shared/types';
import { featureClient, mutation, resourceID } from '../_shared/transport';
import type { Job, Application, ApplicationReceipt } from './types';
export function createCareersApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    list: (options: ListOptions = {}) =>
      api<Page<Job>>('/careers/jobs', {
        query: { page: options.page, pageSize: options.pageSize },
        signal: options.signal,
      }),
    get: (id: string, signal?: AbortSignal) =>
      api<Job>(`/careers/jobs/${resourceID(id)}`, { signal }),
    apply: (id: string, body: Application, options: MutationOptions) =>
      api<ApplicationReceipt>(`/careers/jobs/${resourceID(id)}/applications`, {
        method: 'POST',
        body,
        ...mutation(options),
      }),
  };
}
