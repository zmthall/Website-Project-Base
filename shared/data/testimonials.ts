// TODO [CONTENT-01]: Replace template identity, origin, example contacts/assets/testimonials/services and demo article sources with approved client content before enabling production indexing. See docs/integration-audit.md.
/**
 * Testimonial Data
 *
 * Central source for curated testimonials displayed by the website.
 *
 * Testimonials stored here are static, intentionally selected content.
 * Dynamic review retrieval, synchronization, moderation, pagination,
 * provider APIs, and provider-specific metadata belong to the reviews
 * feature rather than this file.
 *
 * Testimonial attribution must remain available as text and must not
 * rely solely on reviewer imagery.
 */

import type { Testimonial } from '../types/testimonials';

/**
 * Curated testimonials for the current website.
 *
 * Required fields:
 * - `id`
 * - `content`
 * - `author.name`
 *
 * Rating, author context, imagery, date, source attribution, featured
 * status, and explicit ordering are optional.
 */
export const testimonials = [
  {
    id: 'testimonial-one',

    content: 'Replace this content with an approved testimonial from the client.',

    /**
     * Public attribution for the testimonial.
     *
     * A textual name or approved public attribution is required even
     * when an author image is supplied.
     */
    author: {
      name: 'Customer Name',
      role: 'Customer',

      // image: {
      //   src: '/images/testimonials/customer-name.jpg',
      //   alt: 'Customer Name',
      // },
    },

    /**
     * Optional rating associated with the testimonial.
     */
    rating: {
      value: 5,
      scale: 5,
    },

    /**
     * Optional calendar date associated with the testimonial.
     */
    date: '2026-01-01',

    /**
     * Optional public source attribution.
     *
     * This identifies where the testimonial originated without storing
     * provider-specific API data.
     */
    source: {
      name: 'Example Source',
      // href: 'https://www.example.com/review/example',
    },

    featured: true,
    order: 1,
  },

  {
    id: 'testimonial-two',

    content: 'Replace this content with another approved client testimonial.',

    author: {
      name: 'Customer Name',
    },

    order: 2,
  },
] satisfies Testimonial[];
