import { createAdminAuthAdapter } from '../features/auth/api';
import { createAdminAuthStore } from '../features/auth/store';
export default defineNuxtPlugin({
  name: 'admin-auth',
  setup: () => ({ provide: { adminAuth: createAdminAuthStore(createAdminAuthAdapter()) } }),
});
