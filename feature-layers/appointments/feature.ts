import { defineFeature } from '../definition';

export default defineFeature({
  key: 'appointments',
  name: 'Appointments',
  description: 'Availability, booking, rescheduling and cancellation workflows.',
  configuration: 'boolean',
  maturity: 'foundation',
  dependencies: ['customer'],
  routes: ['/appointments'],
  sitemapRoutes: ['/appointments'],
  implementation: {
    app: [
      'feature-layers/appointments/index.ts',
      'feature-layers/appointments/app/features/appointments',
      'feature-layers/appointments/app/pages/appointments.vue',
      'feature-layers/appointments/app/components/appointments/CustomerManager.vue',
    ],
    server: [
      'feature-layers/appointments/server/api/workflows/appointments/index.ts',
      'feature-layers/appointments/server/api/workflows/appointments/[...path].ts',
      'feature-layers/appointments/server/services/appointments.ts',
      'feature-layers/appointments/server/utils/appointment-service.ts',
    ],
    shared: [
      'app/api/types.ts',
      'feature-layers/_shared/transport.ts',
      'app/composables/useWorkflows.ts',
      'app/pages/customer/workflows.vue',
      'server/repositories/workflows.ts',
      'server/services/workflow-support.ts',
      'feature-layers/customer/server/utils/customer-auth.ts',
      'server/utils/bounded-body.ts',
      'shared/types/workflows.ts',
      'shared/utils/scheduling.ts',
    ],
    tests: [
      'feature-layers/appointments/tests/appointments.test.ts',
      'feature-layers/appointments/tests/browser/appointments.spec.ts',
    ],
    docs: ['docs/workflows.md'],
  },
});
