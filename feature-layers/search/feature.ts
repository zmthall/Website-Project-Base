import { defineFeature } from '../definition';

export default defineFeature({
  key: 'search',
  name: 'Search',
  description: 'Scoped site-wide search across public pages, articles, news, and events.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: ['blog', 'events', 'newsletter'],
  routes: ['/search'],
  implementation: {
    app: [
      'feature-layers/search/index.ts',
      'feature-layers/search/app/features/search',
      'feature-layers/search/app/components/sections/search/Results.vue',
      'feature-layers/search/app/pages/search.vue',
    ],
    server: [
      'feature-layers/search/server/api/search.get.ts',
      'feature-layers/search/server/utils/search-index.ts',
      'feature-layers/search/server/utils/search-source.ts',
    ],
    shared: [
      'app/api',
      'app/data/demo.ts',
      'feature-layers/_shared',
      'server/utils/management-store.ts',
      'app/types/sections.ts',
    ],
    tests: [
      'tests/features.test.ts',
      'feature-layers/search/tests/search-index.test.ts',
      'feature-layers/search/tests/browser/search.spec.ts',
    ],
    docs: ['docs/features.md', 'docs/search.md'],
  },
});
