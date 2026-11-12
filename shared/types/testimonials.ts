/**
 * Shared Testimonial Contracts
 *
 * Defines curated testimonial content used throughout the website.
 *
 * These contracts are provider-independent and must not contain raw
 * payloads or provider-specific state from external review platforms.
 *
 * Dynamic review retrieval, synchronization, pagination, filtering,
 * and provider-specific metadata belong to the reviews feature.
 */

import type { ImageMedia } from './image';
import type { Rating } from './rating';

/**
 * Public attribution displayed with a testimonial.
 *
 * Attribution is intentionally flexible because testimonials may be
 * attributed to a full name, abbreviated name, professional role,
 * organization, or another approved public representation.
 */
export interface TestimonialAuthor {
  /**
   * Public-facing attribution name.
   *
   * @example "Jane D."
   */
  name: string;

  /**
   * Optional professional role or descriptive context.
   *
   * @example "Homeowner"
   * @example "Operations Manager"
   */
  role?: string;

  /**
   * Optional organization associated with the testimonial author.
   *
   * @example "Acme Manufacturing"
   */
  organization?: string;

  /**
   * Optional public image associated with the author.
   */
  image?: ImageMedia;
}

/**
 * Identifies the public source from which a testimonial originated.
 *
 * This represents attribution metadata only. Raw provider identifiers,
 * API payloads, synchronization metadata, and other provider-specific
 * information belong to the reviews feature.
 */
export interface TestimonialSource {
  /**
   * Human-readable source or provider name.
   *
   * @example "Google"
   * @example "Facebook"
   */
  name: string;

  /**
   * Optional public URL of the original testimonial or its source.
   */
  href?: string;
}

/**
 * Represents a curated testimonial displayed by the website.
 */
export interface Testimonial {
  /**
   * Stable application identifier for the testimonial.
   */
  id: string;

  /**
   * Public testimonial or review content.
   */
  content: string;

  /**
   * Public attribution associated with the testimonial.
   */
  author: TestimonialAuthor;

  /**
   * Optional rating associated with the testimonial.
   */
  rating?: Rating;

  /**
   * Optional date associated with the testimonial.
   *
   * Use `YYYY-MM-DD` when only the calendar date is meaningful.
   *
   * @example "2026-09-23"
   */
  date?: string;

  /**
   * Optional public source attribution.
   */
  source?: TestimonialSource;

  /**
   * Indicates that the testimonial should receive featured editorial
   * treatment where supported.
   *
   * This does not prescribe a particular component or layout.
   *
   * @default false
   */
  featured?: boolean;

  /**
   * Optional explicit ordering value.
   *
   * Static testimonial collections should generally rely on array order.
   */
  order?: number;
}
