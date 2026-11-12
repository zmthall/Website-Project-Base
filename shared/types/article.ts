/**
 * Shared Article Contracts
 *
 * Defines provider-independent article data used by article components,
 * article sections, listings, related content, and article detail pages.
 *
 * These contracts describe editorial content and metadata only.
 * Content-provider details, presentation variants, and runtime UI state
 * belong outside the shared article contracts.
 */

import type { ImageMedia } from './image';
import type { SEO } from './seo';

/**
 * Represents the public author of an article.
 *
 * This lightweight contract keeps article authors independent from
 * team-member, authentication, user-account, and CMS-specific models.
 */
export interface ArticleAuthor {
  /**
   * Public-facing author name.
   */
  name: string;

  /**
   * Optional URL-friendly identifier when author pages are supported.
   */
  slug?: string;

  /**
   * Optional public author image.
   */
  image?: ImageMedia;
}

/**
 * Represents an article category.
 */
export interface ArticleCategory {
  /**
   * Stable identifier for the category.
   */
  id: string;

  /**
   * Public-facing category name.
   *
   * @example "Home Improvement"
   */
  name: string;

  /**
   * URL-friendly category identifier where category routes are supported.
   *
   * @example "home-improvement"
   */
  slug?: string;
}

/**
 * Represents an article tag.
 */
export interface ArticleTag {
  /**
   * Stable identifier for the tag.
   */
  id: string;

  /**
   * Public-facing tag name.
   *
   * @example "Energy Efficiency"
   */
  name: string;

  /**
   * URL-friendly tag identifier where tag routes are supported.
   *
   * @example "energy-efficiency"
   */
  slug?: string;
}

/**
 * Represents the condensed article data required by cards, listings,
 * search results, related-content sections, and other preview contexts.
 *
 * Article extends this contract so summary and full article data remain
 * consistent without maintaining separate duplicate representations.
 */
export interface ArticleSummary {
  /**
   * Stable application identifier for the article.
   */
  id: string;

  /**
   * URL-friendly identifier used for the article detail route.
   */
  slug: string;

  /**
   * Public-facing article title.
   */
  title: string;

  /**
   * Short article excerpt or description.
   */
  excerpt: string;

  /**
   * Featured image associated with the article.
   */
  image?: ImageMedia;

  /**
   * Public author associated with the article.
   */
  author?: ArticleAuthor;

  /**
   * Publication timestamp.
   *
   * Use an ISO 8601 timestamp.
   */
  publishedAt?: string;

  /**
   * Categories associated with the article.
   */
  categories?: ArticleCategory[];

  /**
   * Tags associated with the article.
   */
  tags?: ArticleTag[];

  /**
   * Optional estimated reading time in minutes.
   *
   * This may be supplied by a content source or calculated from the
   * article content before being exposed to consuming components.
   *
   * @example 6
   */
  readingTimeMinutes?: number;
}

/**
 * Represents a complete published article.
 *
 * Article extends ArticleSummary with the content and metadata required
 * by an article detail page.
 */
export interface Article extends ArticleSummary {
  /**
   * Main article content.
   *
   * The initial contract uses plain text. This may later adopt the
   * platform's shared rich-content contract once that representation
   * has been defined.
   */
  content: string;

  /**
   * Most recent content modification timestamp.
   *
   * Use an ISO 8601 timestamp.
   */
  modifiedAt?: string;

  /**
   * Canonical application path for the article.
   *
   * This is useful when the article's public route cannot be reliably
   * derived from its slug alone.
   *
   * @example "/articles/choosing-replacement-windows"
   */
  path?: string;

  /**
   * SEO metadata for the article detail page.
   *
   * Site-wide defaults and article-derived metadata are resolved by the
   * application's SEO layer.
   */
  seo?: SEO;
}
