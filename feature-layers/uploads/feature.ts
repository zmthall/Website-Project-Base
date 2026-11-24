import { defineFeature } from '../definition';

export default defineFeature({
  key: 'uploads',
  name: 'Uploads',
  description: 'Owner-scoped private file storage, inspection and workflow attachments.',
  configuration: 'boolean',
  maturity: 'active',
  dependencies: ['customer'],
  routes: [],
  implementation: {
    app: [
      'feature-layers/uploads/index.ts',
      'feature-layers/uploads/app/features/uploads',
      'feature-layers/uploads/app/components/forms/FileUpload.vue',
      'feature-layers/uploads/app/components/forms/EstimateAttachments.vue',
    ],
    server: [
      'feature-layers/uploads/server/api/uploads',
      'feature-layers/uploads/server/plugins/uploads.ts',
      'feature-layers/uploads/server/utils',
    ],
    shared: ['app/api', 'feature-layers/_shared', 'app/utils/request-key.ts'],
    tests: [
      'tests/features.test.ts',
      'feature-layers/uploads/tests/upload-store.test.ts',
      'feature-layers/uploads/tests/browser/uploads.spec.ts',
    ],
    docs: ['docs/features.md', 'docs/uploads.md', 'docs/workflows.md'],
  },
});
