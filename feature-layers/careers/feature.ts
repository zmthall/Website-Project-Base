import { defineFeature } from '../definition';
import { careerManagementResources } from './management';

export default defineFeature({
  key: 'careers',
  name: 'Careers',
  description: 'Published openings and private employment applications.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: [],
  routes: ['/careers'],
  sitemapRoutes: ['/careers'],
  management: careerManagementResources,
  implementation: {
    app: [
      'feature-layers/careers/index.ts',
      'feature-layers/careers/management.ts',
      'feature-layers/careers/app/assets/css/careers.css',
      'feature-layers/careers/app/features/careers',
      'feature-layers/careers/app/data/careers.ts',
      'feature-layers/careers/app/components/careers/Application.vue',
      'feature-layers/careers/app/pages/careers',
      'feature-layers/careers/app/pages/admin/jobs.vue',
      'feature-layers/careers/app/pages/admin/applications.vue',
    ],
    server: [
      'feature-layers/careers/server/api/careers/applications.post.ts',
      'feature-layers/careers/server/utils/career-applications.ts',
    ],
    shared: [
      'app/components/admin/ResourceManager.vue',
      'feature-layers/_shared',
      'server/utils/bounded-body.ts',
      'server/utils/management-store.ts',
      'server/utils/management-validation.ts',
      'server/utils/public-submissions.ts',
      'shared/data/management.ts',
      'shared/types/management.ts',
    ],
    tests: [
      'feature-layers/careers/tests/careers.test.ts',
      'feature-layers/careers/tests/browser/careers.spec.ts',
    ],
    docs: ['docs/careers.md'],
  },
});
