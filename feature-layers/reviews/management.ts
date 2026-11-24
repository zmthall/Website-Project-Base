import type { ResourceDefinition, ResourceKind } from '../../shared/types/management';

export const reviewManagementResources = {
  reviews: {
    title: 'Reviews',
    singular: 'review',
    feature: 'reviews',
    canCreate: true,
    primaryFieldLabel: 'Name',
    description: 'Moderate submitted reviews. Only published reviews appear publicly.',
    fields: [
      { key: 'name', label: 'Customer name', required: true },
      { key: 'rating', label: 'Rating (1–5)', type: 'number', required: true },
      { key: 'content', label: 'Review', type: 'textarea', required: true },
      { key: 'notes', label: 'Internal notes', type: 'textarea' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['pending', 'published', 'rejected'],
      },
    ],
  },
} satisfies Partial<Record<ResourceKind, ResourceDefinition>>;
