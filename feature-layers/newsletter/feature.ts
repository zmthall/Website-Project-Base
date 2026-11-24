import { defineFeature } from '../definition';
import { newsletterManagementResources } from './management';

export default defineFeature({
  key: 'newsletter',
  name: 'Newsletter',
  description: 'Published issues and subscription requests.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: [],
  routes: ['/newsletter'],
  sitemapRoutes: ['/newsletter'],
  management: newsletterManagementResources,
  implementation: {
    app: [
      'feature-layers/newsletter/index.ts',
      'feature-layers/newsletter/management.ts',
      'feature-layers/newsletter/app/features/newsletter',
      'feature-layers/newsletter/app/data/newsletter.ts',
      'feature-layers/newsletter/app/composables/useNewsletterContent.ts',
      'feature-layers/newsletter/app/components/newsletter',
      'feature-layers/newsletter/app/components/admin/NewsletterManager.vue',
      'feature-layers/newsletter/app/components/admin/NewsletterSubscribers.vue',
      'feature-layers/newsletter/app/pages/newsletter.vue',
      'feature-layers/newsletter/app/pages/admin/newsletters.vue',
      'feature-layers/newsletter/app/pages/admin/subscribers.vue',
    ],
    server: ['feature-layers/newsletter/server/api/newsletter/subscriptions.post.ts'],
    shared: [
      'app/components/admin/ResourceManager.vue',
      'feature-layers/_shared',
      'server/api/content/[resource].get.ts',
      'server/utils/bounded-body.ts',
      'server/utils/management-store.ts',
      'server/utils/management-validation.ts',
      'server/utils/public-submissions.ts',
      'shared/data/management.ts',
      'shared/types/management.ts',
    ],
    tests: ['feature-layers/newsletter/tests/browser/newsletter.spec.ts'],
    docs: ['docs/newsletter.md'],
  },
});
