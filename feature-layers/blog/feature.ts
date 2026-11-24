import { defineFeature } from '../definition';
import { blogManagementResources } from './management';

export default defineFeature({
  key: 'blog',
  name: 'Blog',
  description: 'Published Markdown articles and administrative editing.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: ['administrator'],
  routes: ['/blog'],
  sitemapRoutes: ['/blog'],
  management: blogManagementResources,
  implementation: {
    app: [
      'feature-layers/blog/index.ts',
      'feature-layers/blog/management.ts',
      'feature-layers/blog/app/components/blog',
      'feature-layers/blog/app/components/admin/BlogManager.vue',
      'feature-layers/blog/app/pages/blog',
      'feature-layers/blog/app/pages/admin/blog.vue',
    ],
    server: [
      'feature-layers/blog/server/api/blog',
      'feature-layers/blog/server/api/admin/blog/preview.post.ts',
      'feature-layers/blog/server/repositories/blog.ts',
      'feature-layers/blog/server/utils/blog-store.ts',
    ],
    shared: [
      'app/components/admin/ResourceManager.vue',
      'app/components/prose',
      'app/composables/useAdminManagement.ts',
      'server/api/admin/manage',
      'server/utils/management-api.ts',
      'server/utils/management-validation.ts',
      'server/utils/markdown.ts',
      'shared/data/management.ts',
      'shared/types/management.ts',
    ],
    tests: ['tests/management.test.ts', 'tests/browser/management.spec.ts'],
    docs: ['docs/blog.md'],
  },
});
