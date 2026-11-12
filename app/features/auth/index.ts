// TODO [AUTH-02]: Implement server Firebase/Supabase verification and password reset/email verification only for configured providers; keep SDK credentials server-side. See docs/integration-audit.md.
export type * from './types';
export { createAdminAuthAdapter } from './api';
export { createAdminAuthStore } from './store';
// Local cookie sessions and admin authorization are implemented; provider/recovery work is tracked above.
