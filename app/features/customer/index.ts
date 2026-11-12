// TODO [AUTH-02]: Implement server Firebase/Supabase verification and password reset/email verification only for configured providers; keep SDK credentials server-side. See docs/integration-audit.md.
export type * from './types';
export { createCustomerAuthAdapter } from './api';
export { createCustomerAuthStore } from './store';
