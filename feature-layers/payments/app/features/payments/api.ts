import type { ApiClient } from '../../../../../app/api/types';
import { featureClient } from '../../../../_shared/transport';
import type { PaymentPurpose, PaymentSession } from '#shared/types/workflows';

export function createPaymentsApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    list: () => api<PaymentSession[]>('/workflows/payments'),
    create: (body: PaymentPurpose, key: string) =>
      api<PaymentSession>('/workflows/payments', {
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
    verify: (id: string) => api<PaymentSession>(`/workflows/payments/${encodeURIComponent(id)}`),
  };
}
