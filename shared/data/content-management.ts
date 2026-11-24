import type { ResourceDefinition, ResourceKind } from '../types/management';

/** Site-wide content that is shared across pages rather than owned by one feature layer. */
export const sharedContentResources = {
  business: {
    title: 'Business information',
    singular: 'business profile',
    canCreate: true,
    description: 'Manage public business identity, contact details, and structured profile data.',
    fields: [
      { key: 'name', label: 'Business name', required: true },
      { key: 'legalName', label: 'Legal name' },
      { key: 'phone', label: 'Public phone' },
      { key: 'email', label: 'Public email', type: 'email' },
      {
        key: 'document',
        label: 'Complete business JSON',
        type: 'textarea',
        help: 'Optional typed Business document for locations, hours, service areas, logos, and social links.',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['draft', 'published'],
      },
    ],
  },
  faqs: {
    title: 'Frequently asked questions',
    singular: 'FAQ',
    canCreate: true,
    description: 'Manage public questions, answers, categories, and display order.',
    fields: [
      { key: 'question', label: 'Question', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      { key: 'categoryId', label: 'Category ID' },
      { key: 'order', label: 'Display order', type: 'number', min: 0, max: 10000, step: 1 },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['draft', 'published'],
      },
    ],
  },
  media: {
    title: 'Media library',
    singular: 'media item',
    canCreate: true,
    description: 'Manage reusable public images, video sources, and provider references.',
    fields: [
      { key: 'title', label: 'Title', required: true },
      {
        key: 'kind',
        label: 'Media kind',
        type: 'select',
        required: true,
        options: ['image', 'video', 'video-embed'],
      },
      { key: 'src', label: 'Source path or provider ID', required: true },
      { key: 'alt', label: 'Alternative text' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['draft', 'published'],
      },
    ],
  },
  ratings: {
    title: 'Ratings',
    singular: 'rating aggregate',
    canCreate: true,
    description: 'Manage sourced aggregate ratings separately from individual moderated reviews.',
    fields: [
      { key: 'name', label: 'Label or source', required: true },
      { key: 'value', label: 'Rating value', type: 'number', required: true, min: 0, max: 5, step: 0.1 },
      { key: 'ratingCount', label: 'Rating count', type: 'number', min: 0, max: 1000000000, step: 1 },
      { key: 'reviewCount', label: 'Review count', type: 'number', min: 0, max: 1000000000, step: 1 },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['draft', 'published'],
      },
    ],
  },
} satisfies Partial<Record<ResourceKind, ResourceDefinition>>;
