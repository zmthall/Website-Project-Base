import type { ResourceDefinition, ResourceKind } from '../../shared/types/management';

export const newsletterManagementResources = {
  newsletters: {
    title: 'Newsletter issues',
    singular: 'issue',
    feature: 'newsletter',
    canCreate: true,
    description: 'Write and publish website newsletter issues. Email delivery is not connected.',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'issue', label: 'Issue label', required: true },
      { key: 'summary', label: 'Introduction', type: 'textarea', required: true },
      { key: 'content', label: 'Markdown content', type: 'textarea', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
      {
        key: 'publishedAt',
        label: 'Publication date and time',
        type: 'datetime-local',
        help: 'A future date schedules publication. Uses your browser timezone.',
      },
    ],
  },
  subscribers: {
    title: 'Newsletter subscribers',
    singular: 'subscriber',
    feature: 'newsletter',
    canCreate: false,
    primaryFieldLabel: 'Email',
    editableFields: ['status'],
    description: 'Local subscription requests and consent records. No emails are sent.',
    fields: [
      { key: 'email', label: 'Email address', type: 'email', required: true },
      { key: 'listId', label: 'List' },
      { key: 'consentAt', label: 'Consent recorded at' },
      { key: 'status', label: 'Status', type: 'select', options: ['requested', 'unsubscribed'] },
    ],
  },
} satisfies Partial<Record<ResourceKind, ResourceDefinition>>;
