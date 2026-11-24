import { defineFeature } from '../definition';
import { eventManagementResources } from './management';

export default defineFeature({
  key: 'events',
  name: 'Events',
  description: 'Published events, calendar presentation and event structured data.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: [],
  routes: ['/events'],
  sitemapRoutes: ['/events'],
  management: eventManagementResources,
  implementation: {
    app: [
      'feature-layers/events/index.ts',
      'feature-layers/events/management.ts',
      'feature-layers/events/app/features/events',
      'feature-layers/events/app/components/events/Calendar.vue',
      'feature-layers/events/app/components/admin/EventsManager.vue',
      'feature-layers/events/app/pages/events.vue',
      'feature-layers/events/app/pages/admin/events.vue',
    ],
    server: ['feature-layers/events/server/repositories/events.ts'],
    shared: [
      'app/components/admin/ResourceManager.vue',
      'server/api/content/[resource].get.ts',
      'shared/data/management.ts',
      'shared/types/management.ts',
      'shared/utils/scheduling.ts',
    ],
    tests: [
      'feature-layers/events/tests/event-schema.test.ts',
      'feature-layers/events/tests/browser/events.spec.ts',
    ],
    docs: ['docs/events.md'],
  },
});
