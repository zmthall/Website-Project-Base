/**
 * Shared SEO Contracts
 *
 * Provider-independent SEO metadata used by pages, articles,
 * services, locations, and other indexable site content.
 *
 * These contracts describe SEO content and intent only. Resolution of
 * site-wide defaults, title templates, canonical URLs, social fallbacks,
 * and framework-specific metadata belongs to the application's SEO
 * composables and utilities.
 */

import type { ImageMedia } from './image';

/**
 * Controls whether search engines should index a page and follow links
 * discovered on it.
 *
 * Both values are optional so page-level configuration can override only
 * the behavior it needs while inheriting remaining site-wide defaults.
 */
export interface RobotsConfig {
  /**
   * Whether search engines should include the page in their index.
   *
   * `false` should resolve to a `noindex` directive.
   *
   * @default true
   */
  index?: boolean;

  /**
   * Whether search engines should follow links found on the page.
   *
   * `false` should resolve to a `nofollow` directive.
   *
   * @default true
   */
  follow?: boolean;
}

/**
 * Supported Open Graph content types.
 *
 * The initial contract intentionally covers the content types commonly
 * required by the website platform. Additional types can be introduced
 * when a concrete requirement appears.
 */
export type OpenGraphType = 'website' | 'article';

/**
 * Optional Open Graph-specific metadata.
 *
 * Values omitted here should normally fall back to the corresponding
 * general SEO metadata when resolved by `useSEO`.
 */
export interface OpenGraphMetadata {
  /**
   * Open Graph title.
   *
   * Falls back to the resolved page title when omitted.
   */
  title?: string;

  /**
   * Open Graph description.
   *
   * Falls back to the page meta description when omitted.
   */
  description?: string;

  /**
   * Open Graph sharing image.
   *
   * Falls back to the page or site-wide social image when omitted.
   */
  image?: ImageMedia;

  /**
   * Open Graph content type.
   *
   * @default 'website'
   */
  type?: OpenGraphType;
}

/**
 * Supported Twitter/X card presentation types.
 */
export type TwitterCardType = 'summary' | 'summary_large_image';

/**
 * Optional Twitter/X-specific metadata.
 *
 * Values omitted here should normally fall back to general or Open Graph
 * metadata when resolved by `useSEO`.
 */
export interface TwitterMetadata {
  /**
   * Twitter/X card presentation type.
   *
   * A large-image card is generally appropriate when a social sharing
   * image is available.
   */
  card?: TwitterCardType;

  /**
   * Twitter/X-specific title.
   *
   * Falls back to Open Graph or general page title metadata.
   */
  title?: string;

  /**
   * Twitter/X-specific description.
   *
   * Falls back to Open Graph or general page description metadata.
   */
  description?: string;

  /**
   * Twitter/X-specific sharing image.
   *
   * Falls back to Open Graph or general social imagery.
   */
  image?: ImageMedia;

  /**
   * Twitter/X account associated with the website.
   *
   * @example "@example"
   */
  site?: string;

  /**
   * Twitter/X account associated with the content creator.
   *
   * @example "@author"
   */
  creator?: string;
}

/**
 * Identifies an author associated with indexable content.
 *
 * This lightweight representation avoids coupling SEO metadata to a
 * specific team-member, CMS-author, or user model.
 */
export interface SEOAuthor {
  /**
   * Public-facing author name.
   */
  name: string;

  /**
   * Optional canonical/public URL associated with the author.
   */
  url?: string;
}

/**
 * Alternate-language version of the current content.
 *
 * Used to generate alternate hreflang links for multilingual sites.
 */
export interface SEOAlternateLanguage {
  /**
   * Language or language-region identifier.
   *
   * @example "en"
   * @example "en-US"
   * @example "es-US"
   * @example "x-default"
   */
  hreflang: string;

  /**
   * URL or application path of the alternate version.
   */
  href: string;
}

/**
 * Article-like metadata that is only relevant to publishable content.
 *
 * Keeping these fields grouped prevents the primary SEO contract from
 * accumulating unrelated article properties.
 */
export interface SEOArticleMetadata {
  /**
   * Publication timestamp.
   *
   * ISO 8601 should be used.
   *
   * @example "2026-09-23T09:00:00-06:00"
   */
  publishedAt?: string;

  /**
   * Most recent modification timestamp.
   *
   * ISO 8601 should be used.
   */
  modifiedAt?: string;

  /**
   * Authors associated with the content.
   */
  authors?: SEOAuthor[];

  /**
   * Optional article section or category.
   *
   * @example "Home Improvement"
   */
  section?: string;

  /**
   * Optional article tags.
   */
  tags?: string[];
}

/**
 * Identifies structured-data/schema types that should be generated for
 * the current content.
 *
 * This is configuration only. Actual schema.org objects should be created
 * by dedicated structured-data utilities using typed domain data.
 */
export type StructuredDataKind =
  | 'organization'
  | 'local-business'
  | 'website'
  | 'breadcrumb'
  | 'service'
  | 'article'
  | 'faq'
  | 'event'
  | 'job-posting';

/**
 * Structured-data configuration for indexable content.
 *
 * This contract declares which structured-data representations are
 * appropriate. It does not contain raw JSON-LD objects.
 */
export interface StructuredDataConfig {
  /**
   * Structured-data types that should be generated for the content.
   */
  kinds: StructuredDataKind[];
}

/**
 * Shared SEO metadata for indexable application content.
 *
 * Most properties are optional because this contract is designed to
 * support both site-wide defaults and page-level overrides.
 *
 * `useSEO` is responsible for merging this configuration with site
 * defaults and producing final framework-specific metadata.
 *
 * At minimum, an indexable page should normally provide a meaningful
 * `title` and `description`. Other values may be inherited or derived
 * from site-wide configuration.
 */
export interface SEO {
  /**
   * Page-specific title.
   *
   * This should normally contain only the page portion of the title.
   * Site-wide title composition should be handled by `useSEO`.
   *
   * @example
   * "Window Replacement"
   *
   * May resolve to:
   * "Window Replacement | Acme Windows"
   */
  title?: string;

  /**
   * Meta description describing the page's primary content.
   */
  description?: string;

  /**
   * Controls whether the site-wide title template should be applied.
   *
   * This allows exceptional pages to supply an already-complete title
   * without requiring every page to construct the site's final title.
   *
   * @default true
   */
  useTitleTemplate?: boolean;

  /**
   * Explicit canonical URL or application path.
   *
   * When omitted, `useSEO` should derive the canonical URL from the
   * current route and configured site origin.
   *
   * Tracking parameters and fragments should not be included in
   * generated canonical URLs.
   */
  canonical?: string;

  /**
   * Search-engine indexing and crawling behavior.
   */
  robots?: RobotsConfig;

  /**
   * Preferred social-sharing image.
   *
   * Open Graph and Twitter/X metadata may fall back to this image before
   * falling back to the site-wide default social image.
   */
  image?: ImageMedia;

  /**
   * Open Graph-specific metadata.
   */
  openGraph?: OpenGraphMetadata;

  /**
   * Twitter/X-specific metadata.
   */
  twitter?: TwitterMetadata;

  /**
   * Locale associated with this content.
   *
   * Prefer a language-region identifier when appropriate.
   *
   * @example "en-US"
   */
  locale?: string;

  /**
   * Additional locales in which equivalent content is available.
   *
   * This is useful for Open Graph locale metadata. Alternate page URLs
   * should be represented using `alternateLanguages`.
   */
  alternateLocales?: string[];

  /**
   * Alternate-language versions of the current content.
   *
   * Used to generate hreflang link metadata for equivalent content
   * available at other locale-specific URLs.
   */
  alternateLanguages?: SEOAlternateLanguage[];

  /**
   * Article-specific metadata.
   *
   * Should generally be supplied only for article-like content.
   */
  article?: SEOArticleMetadata;

  /**
   * Structured-data representations appropriate for this content.
   *
   * Actual JSON-LD generation belongs to dedicated structured-data
   * utilities or composables.
   */
  structuredData?: StructuredDataConfig;

  /**
   * Optional keywords metadata required by a specific integration.
   *
   * This should not be treated as a meaningful modern search-ranking
   * mechanism and normally should be omitted.
   */
  keywords?: string[];
}
