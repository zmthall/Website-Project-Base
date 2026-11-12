import type { ApiClient } from '../../api/types';
import type { MutationOptions } from '../_shared/types';
import { featureClient, mutation } from '../_shared/transport';
import type { ContactInquiry, ContactReceipt } from './types';
export function createContactApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    submit: (inquiry: ContactInquiry, options: MutationOptions) =>
      api<ContactReceipt>('/contact', { method: 'POST', body: inquiry, ...mutation(options) }),
  };
}
