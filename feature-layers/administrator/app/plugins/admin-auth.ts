import { createAdminAuthAdapter, createAdminAuthStore } from '../features/administrator';
export default defineNuxtPlugin({
  name: 'admin-auth',
  setup: () => ({ provide: { adminAuth: createAdminAuthStore(createAdminAuthAdapter()) } }),
});
