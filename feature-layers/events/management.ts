import type { ResourceDefinition, ResourceKind } from '../../shared/types/management';

export const eventManagementResources = {
  events: {
    title: 'Events',
    singular: 'event',
    feature: 'events',
    canCreate: true,
    description: 'Manage public calendar events and draft upcoming gatherings.',
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'date', label: 'Event date', type: 'date', required: true },
      { key: 'startTime', label: 'Start time', type: 'time', required: true },
      { key: 'endTime', label: 'End time', type: 'time', required: true },
      { key: 'timeZone', label: 'Timezone', required: true, help: 'For example America/Denver.' },
      { key: 'category', label: 'Category', required: true },
      { key: 'location', label: 'Location', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      {
        key: 'onlineUrl',
        label: 'Online event URL (HTTPS)',
        type: 'url',
        help: 'Or add a postal address below for event structured data.',
      },
      { key: 'street', label: 'Street address' },
      { key: 'city', label: 'City' },
      { key: 'region', label: 'State / region' },
      { key: 'postalCode', label: 'Postal code' },
      { key: 'countryCode', label: 'Country code', help: 'Two letters, for example US.' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['draft', 'published', 'cancelled'],
      },
    ],
  },
} satisfies Partial<Record<ResourceKind, ResourceDefinition>>;
