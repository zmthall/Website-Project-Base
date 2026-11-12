/**
 * Services Data
 *
 * Central source for the services offered by the current business.
 *
 * Each service must provide a stable identifier, route slug, public
 * name, and short summary. Additional descriptive content, imagery,
 * actions, categorization, ordering, and SEO metadata are optional.
 *
 * Filtering, route resolution, presentation variants, and other
 * runtime behavior do not belong in this file.
 */

import type { Service } from '../types/service';

/**
 * Services offered by the current business.
 *
 * Required fields:
 * - `id`
 * - `slug`
 * - `name`
 * - `summary`
 *
 * Optional fields should be added only when meaningful for the
 * configured client and available to consuming components.
 */
export const services = [
  {
    id: 'service-one',
    slug: 'service-one',
    name: 'Service One',

    summary: 'A short description explaining the primary purpose and value of this service.',

    description:
      'A more complete description of the service for use on its detail page or other expanded content.',

    /**
     * Optional icon identifier.
     *
     * The rendering layer determines how this identifier maps to the
     * configured icon system.
     */
    icon: 'example-icon',

    /**
     * Optional featured image.
     */
    // image: {
    //   src: '/images/services/service-one.jpg',
    //   alt: 'Description of Service One',
    // },

    /**
     * Optional actions associated with the service.
     */
    actions: [
      {
        type: 'route',
        to: '/services/service-one',
        label: 'Learn More',
        intent: 'primary',
      },
    ],

    /**
     * Optional grouping identifier.
     */
    category: 'example-category',

    /**
     * Indicates that the service may receive featured editorial
     * treatment where supported.
     */
    featured: true,

    /**
     * Explicit ordering is useful when services may be assembled,
     * filtered, or reordered independently of this array.
     */
    order: 1,

    /**
     * Optional SEO metadata for the service detail page.
     *
     * Site-wide defaults are inherited through the SEO resolution layer.
     */
    seo: {
      title: 'Service One',
      description: 'Replace this with a search-friendly description of Service One.',

      structuredData: {
        kinds: ['service', 'breadcrumb'],
      },
    },
  },

  {
    id: 'service-two',
    slug: 'service-two',
    name: 'Service Two',

    summary: 'A short description explaining the primary purpose and value of this service.',

    actions: [
      {
        type: 'route',
        to: '/services/service-two',
        label: 'Learn More',
      },
    ],

    category: 'example-category',
    order: 2,
  },

  {
    id: 'service-three',
    slug: 'service-three',
    name: 'Service Three',

    summary: 'A short description explaining the primary purpose and value of this service.',

    actions: [
      {
        type: 'route',
        to: '/services/service-three',
        label: 'Learn More',
      },
    ],

    category: 'another-category',
    order: 3,
  },
] satisfies Service[];
