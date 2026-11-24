// TODO [CONTENT-01]: Replace template identity, origin, example contacts/assets/testimonials/services and demo article sources with approved client content before enabling production indexing. See docs/integration-audit.md.
/**
 * Site Configuration
 *
 * Top-level frontend-safe configuration for the current website.
 *
 * This file is one of the primary configuration points when creating
 * a new client site. It composes centralized business, navigation, SEO,
 * locale, and feature configuration into the shared SiteConfig contract.
 *
 * Runtime state, environment-specific secrets, private credentials, and
 * server-only configuration must not be placed here.
 */

import type { SiteConfig } from '../types/site';

import { business } from './business';
import { footerNavigation, primaryNavigation } from './navigation';
import { features } from '../../feature-layers/features';

/**
 * Primary configuration for the current website.
 *
 * Client implementations should replace the placeholder identity,
 * canonical URL, SEO defaults, locale configuration, and feature
 * configuration with values appropriate for the deployed website.
 */
export const site = {
  /**
   * Public-facing website or brand name.
   *
   * This commonly matches `business.name`, but may differ when the
   * website operates under a distinct public-facing brand.
   */
  name: 'Website Name',

  /**
   * Canonical production origin of the website.
   *
   * Do not use development, preview, or deployment-specific URLs here.
   */
  url: 'https://www.example.com',

  /**
   * Centralized public business configuration.
   */
  business,

  /**
   * Centralized site navigation configuration.
   */
  navigation: {
    primary: primaryNavigation,
    footer: footerNavigation,
  },

  /**
   * Site-wide SEO defaults.
   *
   * Page-specific metadata may override these values through `useSEO`.
   */
  seo: {
    /**
     * Default title used when content does not provide its own title.
     */
    title: 'Website Name',

    /**
     * Template used to compose page-specific document titles.
     *
     * `%s` is replaced by the resolved page title.
     */
    titleTemplate: '%s | Website Name',

    /**
     * Public-facing website name used by metadata formats that
     * distinguish the site identity from the current page title.
     */
    siteName: 'Website Name',

    /**
     * Default meta description used when page-specific content does not
     * provide one.
     */
    description: 'Replace this description with the default description for the website.',

    /**
     * Default social-sharing image.
     *
     * Configure this when the client has a suitable default social image.
     */
    // image: {
    //   src: '/images/social/default.jpg',
    //   alt: 'Website Name',
    // },

    /**
     * Default search-engine indexing and link-following behavior.
     */
    robots: {
      index: true,
      follow: true,
    },

    /**
     * Default locale associated with site-wide SEO and social metadata.
     */
    locale: 'en-US',

    /**
     * Default Open Graph configuration.
     *
     * Title, description, and image normally fall back to the resolved
     * general SEO metadata.
     */
    openGraph: {
      type: 'website',
    },

    /**
     * Default Twitter/X card configuration.
     */
    twitter: {
      card: 'summary_large_image',
    },

    /**
     * Structured-data representations that normally apply to the
     * website as a whole.
     *
     * Actual JSON-LD objects are generated separately from the site's
     * typed business and site configuration.
     */
    structuredData: {
      kinds: ['organization', 'website'],
    },
  },

  /**
   * Site language and locale configuration.
   */
  locale: {
    default: 'en-US',
  },

  /**
   * Optional platform capabilities enabled for this client website.
   *
   * Feature-specific configuration belongs to the corresponding feature.
   */
  features
} satisfies SiteConfig;
