import type { ResourceDefinition, ResourceKind } from '../../shared/types/management';

export const contactManagementResources = {
  messages: {
    title: 'Contact messages',
    singular: 'message',
    feature: 'contact',
    canCreate: false,
    description: 'Read incoming inquiries, add internal notes, and track follow-up.',
    primaryFieldLabel: 'Name',
    manageLabel: 'Read / manage',
    editableFields: ['notes', 'status'],
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'email', label: 'Email address', type: 'email', required: true },
      { key: 'reason', label: 'Topic' },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'notes', label: 'Internal notes', type: 'textarea' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['new', 'read', 'replied', 'archived'],
      },
    ],
  },
} satisfies Partial<Record<ResourceKind, ResourceDefinition>>;
