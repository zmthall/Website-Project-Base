// TODO [NEWS-01]: Implement double-opt-in confirmation, signed expiring unsubscribe/preferences tokens, webhook signature checks, suppression/deduplication and provider synchronization. See docs/integration-audit.md.
import type { ApiClient } from '../../api/types';
import type { MutationOptions } from '../_shared/types';
import { featureClient, mutation } from '../_shared/transport';
import type { SubscriptionRequest, SubscriptionResult, NewsletterPreferences } from './types';
export function createNewsletterApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    subscribe: (body: SubscriptionRequest, options: MutationOptions) =>
      api<SubscriptionResult>('/newsletter/subscriptions', {
        method: 'POST',
        body,
        ...mutation(options),
      }),
    confirm: (token: string, options: MutationOptions) =>
      api<SubscriptionResult>('/newsletter/confirm', {
        method: 'POST',
        body: { token },
        ...mutation(options),
      }),
    unsubscribe: (token: string, options: MutationOptions) =>
      api<undefined>('/newsletter/unsubscribe', {
        method: 'POST',
        body: { token },
        ...mutation(options),
      }),
    preferences: (signal?: AbortSignal) =>
      api<NewsletterPreferences>('/newsletter/preferences', { auth: true, signal }),
    updatePreferences: (body: NewsletterPreferences, options: MutationOptions) =>
      api<NewsletterPreferences>('/newsletter/preferences', {
        method: 'PATCH',
        auth: true,
        body,
        ...mutation(options),
      }),
  };
}
