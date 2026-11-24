import { defineFeature } from '../definition';
import { contactManagementResources } from './management';

export default defineFeature({
  key: 'contact',
  name: 'Contact',
  description: 'Public inquiries and private administrator review.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: [],
  routes: ['/contact'],
  sitemapRoutes: ['/contact'],
  management: contactManagementResources,
  implementation: {
    app: [
      'feature-layers/contact/index.ts',
      'feature-layers/contact/management.ts',
      'feature-layers/contact/theme.ts',
      'feature-layers/contact/app/features/contact',
      'feature-layers/contact/app/pages/contact.vue',
      'feature-layers/contact/app/components/admin/ContactMessages.vue',
      'feature-layers/contact/app/pages/admin/messages.vue',
    ],
    server: ['feature-layers/contact/server/api/contact.post.ts'],
    shared: [
      'app/api/types.ts',
      'feature-layers/_shared',
      'app/types/forms.ts',
      'shared/types/management.ts',
      'server/utils/bounded-body.ts',
      'server/utils/public-submissions.ts',
      'server/utils/management-validation.ts',
      'server/utils/management-store.ts',
    ],
    tests: [
      'feature-layers/contact/tests/contact.test.ts',
      'feature-layers/contact/tests/browser/contact.spec.ts',
      'tests/browser/management.spec.ts',
    ],
    docs: ['docs/request-forms.md'],
  },
});
