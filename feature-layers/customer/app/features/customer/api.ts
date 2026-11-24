// TODO [AUTH-02]: Implement server Firebase/Supabase verification and password reset/email verification only for configured providers; keep SDK credentials server-side. See docs/integration-audit.md.
import { ofetch } from 'ofetch';
import type { CustomerAuthAdapter, CustomerSessionResponse } from './types';
export function createCustomerAuthAdapter(): CustomerAuthAdapter {
  const request = ofetch.create({
    baseURL: '/api/customer/auth',
    credentials: 'same-origin',
    retry: 0,
    timeout: 15000,
  });
  const authenticate = (path: string, email: string, password: string, csrf: string) =>
    request<CustomerSessionResponse>(path, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrf },
      body: { email, password },
    });
  return {
    session: () => request<CustomerSessionResponse>('/session'),
    login: (email, password, csrf) => authenticate('/login', email, password, csrf),
    register: (email, password, csrf) => authenticate('/register', email, password, csrf),
    logout: async (csrf) => {
      await request('/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrf } });
    },
  };
}
