// TODO [AUTH-02]: Implement server Firebase/Supabase verification and password reset/email verification only for configured providers; keep SDK credentials server-side. See docs/integration-audit.md.
import { ofetch } from 'ofetch';
import type { AdminAuthAdapter, AdminAuthSettings, SessionResponse } from './types';

/** Same-origin backend bridge for all providers. HttpOnly session cookies stay out of JS. */
export function createAdminAuthAdapter(): AdminAuthAdapter {
  const request = ofetch.create({
    baseURL: '/api/admin',
    credentials: 'same-origin',
    retry: 0,
    timeout: 15000,
  });
  const headers = (csrf: string) => ({ 'X-CSRF-Token': csrf });
  return {
    session: () => request<SessionResponse>('/auth/session'),
    login: (email, password, csrf) =>
      request<SessionResponse>('/auth/login', {
        method: 'POST',
        headers: headers(csrf),
        body: { email, password },
      }),
    logout: async (csrf) => {
      await request('/auth/logout', { method: 'POST', headers: headers(csrf) });
    },
    resetPassword: async (email, csrf) => {
      await request('/auth/password-reset', {
        method: 'POST',
        headers: headers(csrf),
        body: { email },
      });
    },
    getSettings: () => request<AdminAuthSettings>('/settings/auth'),
    saveSettings: async (update, csrf) => {
      await request('/settings/auth', { method: 'PUT', headers: headers(csrf), body: update });
    },
  };
}
