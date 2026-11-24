import { defineFeature } from '../definition';

export default defineFeature({
  key: 'products',
  name: 'Products',
  description: 'Optional product catalog capability reserved by the site contract.',
  configuration: 'boolean',
  maturity: 'planned',
  dependencies: [],
  routes: ['/products'],
  implementation: {
    app: ['feature-layers/products/index.ts'],
  },
});
