import type { ApiClient } from '../../api/types';
import type { MutationOptions, ListOptions, Page } from '../_shared/types';
import { featureClient, mutation } from '../_shared/transport';
import type { Review, ReviewSummary, ReviewSubmission, ReviewReceipt } from './types';
export function createReviewsApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    list: (options: ListOptions = {}) =>
      api<Page<Review>>('/reviews', {
        query: { page: options.page, pageSize: options.pageSize },
        signal: options.signal,
      }),
    summary: (signal?: AbortSignal) => api<ReviewSummary>('/reviews/summary', { signal }),
    submit: (body: ReviewSubmission, options: MutationOptions) =>
      api<ReviewReceipt>('/reviews', { method: 'POST', body, ...mutation(options) }),
  };
}
