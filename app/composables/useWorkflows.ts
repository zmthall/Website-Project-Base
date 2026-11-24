import { createAppointmentsApi } from '../../feature-layers/appointments';
import { createEstimatesApi } from '../../feature-layers/estimates';
import { createPaymentsApi } from '../../feature-layers/payments';
import type { ApiClient } from '../api/types';
export function useWorkflows() {
  const auth = useCustomerAuth();
  const api: ApiClient = async (path, options = {}) => {
    const headers = new Headers(options.headers);
    if (options.method && options.method !== 'GET') {
      const session = await $fetch<{ csrfToken: string }>('/api/customer/auth/session');
      headers.set('X-CSRF-Token', session.csrfToken);
    }
    return $fetch('/api' + path, {
      method: options.method as 'GET' | 'POST',
      body: options.body as Record<string, unknown>,
      query: options.query,
      headers,
      signal: options.signal,
      retry: 0,
    });
  };
  return {
    auth,
    appointments: createAppointmentsApi(api),
    estimates: createEstimatesApi(api),
    payments: createPaymentsApi(api),
  };
}
