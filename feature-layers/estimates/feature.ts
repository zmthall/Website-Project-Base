import { defineFeature } from '../definition';

export default defineFeature({
  key: 'estimates',
  name: 'Estimates',
  description: 'Estimate requests, quoting, decisions and deposit references.',
  configuration: 'boolean',
  maturity: 'foundation',
  dependencies: ['customer'],
  routes: ['/estimates'],
  sitemapRoutes: ['/estimates'],
  implementation: {
    app: [
      'feature-layers/estimates/index.ts',
      'feature-layers/estimates/app/features/estimates',
      'feature-layers/estimates/app/pages/estimates.vue',
      'feature-layers/estimates/app/pages/admin/estimates.vue',
    ],
    server: [
      'feature-layers/estimates/server/api/workflows/estimates/index.ts',
      'feature-layers/estimates/server/api/workflows/estimates/[...path].ts',
    ],
    shared: [
      'app/composables/useWorkflows.ts',
      'app/pages/customer/workflows.vue',
      'feature-layers/estimates/shared/estimates.ts',
      'server/api/workflows/capabilities.get.ts',
      'server/repositories/workflows.ts',
      'server/services/workflows.ts',
      'server/services/workflow-support.ts',
      'server/utils/workflow-service.ts',
      'shared/data/workflows.ts',
      'shared/types/workflows.ts',
    ],
    tests: ['tests/workflows.test.ts', 'feature-layers/estimates/tests/browser/estimates.spec.ts'],
    docs: ['docs/estimates.md'],
  },
});
