import { defineFeature } from '../definition';
import { reviewManagementResources } from './management';

export default defineFeature({
  key: 'reviews',
  name: 'Reviews',
  description: 'Curated reviews, pending submissions and public aggregates.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: [],
  routes: ['/reviews'],
  sitemapRoutes: ['/reviews'],
  management: reviewManagementResources,
  implementation: {
    app: [
      'feature-layers/reviews/index.ts',
      'feature-layers/reviews/management.ts',
      'feature-layers/reviews/app/features/reviews',
      'feature-layers/reviews/app/data/reviews.ts',
      'feature-layers/reviews/app/components/reviews',
      'feature-layers/reviews/app/components/admin/ReviewsManager.vue',
      'feature-layers/reviews/app/pages/reviews.vue',
      'feature-layers/reviews/app/pages/admin/reviews.vue',
    ],
    server: [
      'feature-layers/reviews/server/api/reviews/index.post.ts',
      'feature-layers/reviews/server/repositories/reviews.ts',
    ],
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
      'shared/types/testimonials.ts',
    ],
    tests: ['feature-layers/reviews/tests/browser/reviews.spec.ts'],
    docs: ['docs/reviews.md'],
  },
});
