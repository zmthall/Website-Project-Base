import type { ResourceDefinition, ResourceKind } from '../../shared/types/management';

export const blogManagementResources = {
  blog: {
    title: 'Blog posts',
    singular: 'post',
    feature: 'blog',
    canCreate: true,
    immutableFields: ['slug'],
    description: 'Write Markdown posts, preview them, and publish now or schedule for later.',
    fields: [
      { key: 'title', label: 'Title', required: true },
      {
        key: 'slug',
        label: 'Slug',
        required: true,
        help: 'Lowercase letters, numbers, and hyphens. Cannot change after creation.',
      },
      { key: 'summary', label: 'Summary', type: 'textarea', required: true },
      { key: 'author', label: 'Author', required: true },
      { key: 'content', label: 'Markdown content', type: 'textarea', required: true },
      { key: 'tags', label: 'Tags', help: 'Separate tags with commas.' },
      { key: 'thumbnail', label: 'Thumbnail URL', help: 'Use a /images/ path or an HTTPS URL.' },
      { key: 'thumbnailAlt', label: 'Thumbnail alt text' },
      { key: 'seoTitle', label: 'SEO title' },
      { key: 'seoDescription', label: 'SEO description', type: 'textarea' },
      { key: 'seoImage', label: 'Social image URL' },
      {
        key: 'canonicalUrl',
        label: 'Canonical URL',
        type: 'url',
        help: 'Optional HTTPS canonical URL.',
      },
      { key: 'featured', label: 'Featured post', type: 'checkbox' },
      { key: 'staffPick', label: 'Staff pick', type: 'checkbox' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
      {
        key: 'publishedAt',
        label: 'Publication date and time',
        type: 'datetime-local',
        help: 'A future date schedules publication. Uses your browser timezone.',
      },
    ],
  },
} satisfies Partial<Record<ResourceKind, ResourceDefinition>>;
