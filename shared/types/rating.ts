/**
 * Shared Rating Contracts
 *
 * Defines provider-independent rating information used by businesses,
 * testimonials, reviews, and other publicly rated content.
 */

/**
 * Represents a single rating value and its scale.
 */
export interface Rating {
  /**
   * Rating value.
   *
   * @example 4.8
   * @example 5
   */
  value: number;

  /**
   * Maximum value of the rating scale.
   *
   * @default 5
   *
   * @example 5
   */
  scale?: number;
}

/**
 * Represents an aggregate rating calculated from multiple individual
 * ratings or reviews.
 */
export interface AggregateRating extends Rating {
  /**
   * Number of ratings contributing to the aggregate rating.
   */
  ratingCount?: number;

  /**
   * Number of written reviews represented by the aggregate.
   *
   * This may differ from `ratingCount` when users can submit ratings
   * without written reviews.
   */
  reviewCount?: number;
}
