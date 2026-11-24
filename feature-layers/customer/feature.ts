import { defineFeature } from '../definition';

export default defineFeature({
  key: 'customer',
  name: 'Customer accounts',
  description: 'Customer registration, sessions and owned workflow access.',
  configuration: 'provider',
  maturity: 'active',
  dependencies: [],
  routes: ['/customer'],
  implementation: {
    app: [
      'feature-layers/customer/index.ts',
      'feature-layers/customer/nuxt.config.ts',
      'feature-layers/customer/app/features/customer',
      'feature-layers/customer/app/plugins/customer-auth.ts',
      'feature-layers/customer/app/plugins/customer-session.client.ts',
      'feature-layers/customer/app/composables/useCustomerAuth.ts',
      'feature-layers/customer/app/middleware/customer.global.ts',
      'feature-layers/customer/app/layouts/customer.vue',
      'feature-layers/customer/app/pages/customer/index.vue',
      'feature-layers/customer/app/pages/customer/login.vue',
    ],
    server: [
      'feature-layers/customer/server/api/customer/auth',
      'feature-layers/customer/server/middleware/customer.ts',
      'feature-layers/customer/server/utils/customer-accounts.ts',
      'feature-layers/customer/server/utils/customer-auth.ts',
      'feature-layers/customer/server/utils/customer-database.ts',
    ],
    shared: [
      'app/components/shell/Header.vue',
      'app/components/shell/MobileNavigation.vue',
      'app/composables/useWorkflows.ts',
      'app/pages/customer/workflows.vue',
      'server/utils/auth-settings.ts',
      'server/utils/secrets.ts',
      'shared/data/site.ts',
      'shared/types/auth.ts',
      'shared/types/management.ts',
    ],
    tests: [
      'feature-layers/customer/tests/customer-auth.test.ts',
      'feature-layers/customer/tests/browser/customer.spec.ts',
    ],
    docs: ['docs/authentication.md'],
  },
});
