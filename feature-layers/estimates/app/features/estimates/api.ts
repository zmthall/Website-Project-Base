import type { ApiClient } from '../../../../../app/api/types';
import { featureClient } from '../../../../_shared/transport';
import type { Estimate, EstimateRequest } from '#shared/types/workflows';

export function createEstimatesApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    list: () => api<Estimate[]>('/workflows/estimates'),
    get: (id: string) => api<Estimate>(`/workflows/estimates/${encodeURIComponent(id)}`),
    request: (body: EstimateRequest, key: string) =>
      api<Estimate>('/workflows/estimates', {
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
    decide: (id: string, decision: 'accepted' | 'declined', version: number, key: string) =>
      api<Estimate>(`/workflows/estimates/${encodeURIComponent(id)}/decision`, {
        method: 'POST',
        body: { decision, version },
        headers: { 'Idempotency-Key': key },
      }),
  };
}
