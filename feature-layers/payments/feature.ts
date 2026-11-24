import { defineFeature } from '../definition';

export default defineFeature({
  key: 'payments',
  name: 'Payments',
  description: 'Hosted-payment contracts and card-free demonstration workflows.',
  configuration: 'boolean',
  maturity: 'foundation',
  dependencies: ['customer'],
  routes: [],
  implementation: {
    app: ['feature-layers/payments/index.ts', 'feature-layers/payments/app/features/payments'],
    server: [
      'feature-layers/payments/server/api/workflows/payments/index.ts',
      'feature-layers/payments/server/api/workflows/payments/[...path].ts',
    ],
    shared: [
      'app/composables/useWorkflows.ts',
      'app/pages/customer/workflows.vue',
      'server/api/workflows/capabilities.get.ts',
      'server/repositories/workflows.ts',
      'server/services/workflows.ts',
      'server/services/workflow-support.ts',
      'server/utils/workflow-service.ts',
      'shared/data/workflows.ts',
      'shared/types/workflows.ts',
    ],
    tests: ['tests/workflows.test.ts'],
    docs: ['docs/workflows.md'],
  },
});
