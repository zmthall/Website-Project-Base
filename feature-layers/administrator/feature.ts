import { defineFeature } from '../definition';

export default defineFeature({
  key: 'administrator',
  name: 'Administration',
  description: 'Administrator identity, sessions and protected management access.',
  configuration: 'provider',
  maturity: 'active',
  dependencies: [],
  routes: ['/admin'],
  implementation: {
    app: [
      'feature-layers/administrator/index.ts',
      'feature-layers/administrator/app/features/administrator',
      'feature-layers/administrator/app/plugins/admin-auth.ts',
      'feature-layers/administrator/app/plugins/admin-session.client.ts',
      'feature-layers/administrator/app/composables/useAdminAuth.ts',
      'feature-layers/administrator/app/middleware/admin.global.ts',
      'feature-layers/administrator/app/layouts/admin.vue',
      'feature-layers/administrator/app/pages/admin/login.vue',
      'feature-layers/administrator/app/pages/admin/auth.vue',
      'feature-layers/administrator/app/pages/admin/index.vue',
      'feature-layers/administrator/app/pages/admin/[resource].vue',
      'feature-layers/administrator/app/components/admin/AuthSettings.vue',
    ],
    server: [
      'feature-layers/administrator/server/api/admin/auth',
      'feature-layers/administrator/server/api/admin/settings',
      'feature-layers/administrator/server/middleware/admin.ts',
      'feature-layers/administrator/server/utils/admin-auth.ts',
    ],
    shared: [
      'app/composables/useAdminManagement.ts',
      'app/assets/css/admin.css',
      'server/utils/auth-settings.ts',
      'server/utils/bounded-body.ts',
      'server/utils/management-store.ts',
      'server/utils/secrets.ts',
      'shared/data/management.ts',
      'shared/types/auth.ts',
      'shared/types/management.ts',
    ],
    tests: [
      'feature-layers/administrator/tests/admin-auth.test.ts',
      'feature-layers/administrator/tests/browser/admin.spec.ts',
    ],
    docs: ['docs/authentication.md'],
  },
});
