import type { Business } from './business';
import type { NavigationGroup, NavigationItem } from './navigation';
import type { SEO } from './seo';

/**
 * Navigation configuration for the website.
 *
 * Navigation structures describe configured site navigation only.
 * Active routes, expanded menus, mobile navigation state, and other
 * runtime UI behavior belong to components or composables.
 */
export interface SiteNavigation {
  /**
   * Primary site navigation.
   *
   * This is typically rendered by the main site header or primary
   * navigation interface.
   */
  primary: NavigationItem[];

  /**
   * Optional grouped footer navigation.
   *
   * Groups are useful for footer columns such as Company, Services,
   * Resources, or Support.
   */
  footer?: NavigationGroup[];
}

/**
 * Locale and language configuration for the website.
 *
 * This contract describes supported site locales without prescribing
 * a particular internationalization library, routing strategy, or
 * runtime locale-selection implementation.
 */
export interface SiteLocaleConfig {
  /**
   * Primary locale of the website.
   *
   * Use a BCP 47 language or language-region identifier.
   *
   * @example "en-US"
   * @example "es-MX"
   */
  default: string;

  /**
   * Additional locales supported by the website.
   *
   * The default locale does not need to be repeated here.
   *
   * @example
   * ["es-US", "fr-CA"]
   */
  additional?: string[];
}

/**
 * Optional platform capabilities enabled for the website.
 *
 * These flags describe configured feature availability only. They do
 * not contain feature-specific configuration or runtime feature state.
 *
 * Unless a feature explicitly establishes another platform default,
 * an omitted feature should be treated as disabled.
 */
export interface SiteFeatures {
  appointments?: boolean;
  auth?: false | 'firebase' | 'supabase' | 'local';
  careers?: boolean;
  contact?: boolean;
  blog?: boolean;
  customer?: false | 'firebase' | 'supabase' | 'local';
  estimates?: boolean;
  events?: boolean;
  newsletter?: boolean;
  payments?: boolean;
  products?: boolean;
  reviews?: boolean;
  search?: boolean;
  uploads?: boolean;
}

/**
 * Site-wide SEO configuration.
 *
 * Extends the shared SEO contract with settings that apply specifically
 * to the website as a whole rather than an individual page or content
 * item.
 */
export interface SiteSEOConfig extends SEO {
  /**
   * Template used to compose page-specific document titles.
   *
   * The `%s` placeholder represents the page-specific title and should
   * be replaced by the SEO resolution layer when constructing the final
   * document title.
   *
   * Pages may opt out through `SEO.useTitleTemplate` when a standalone
   * title is required.
   *
   * @example "%s | Acme Home Services"
   */
  titleTemplate?: string;

  /**
   * Public-facing website name used by metadata formats that distinguish
   * the website identity from the current page title.
   *
   * This commonly matches `SiteConfig.name`.
   *
   * @example "Acme Home Services"
   */
  siteName?: string;
}

/**
 * Primary frontend-safe configuration for a client website.
 *
 * `SiteConfig` is the root shared configuration contract for a website
 * built with the platform. It composes lower-level shared contracts
 * rather than duplicating business, navigation, or SEO data.
 *
 * This object is intended to be safe for frontend exposure.
 *
 * Runtime state, secrets, private credentials, and server-only
 * configuration do not belong here.
 */
export interface SiteConfig {
  /**
   * Public-facing name of the website or brand.
   *
   * This commonly matches `business.name`, but remains separate because
   * the website identity may differ from the business identity.
   *
   * @example "Acme Home Services"
   */
  name: string;

  /**
   * Canonical public production origin of the website.
   *
   * @example "https://www.example.com"
   */
  url: string;

  /**
   * Business represented by the website.
   */
  business: Business;

  /**
   * Configured site navigation.
   */
  navigation: SiteNavigation;

  /**
   * Site-wide SEO defaults and metadata composition configuration.
   *
   * Page and content-specific SEO configuration may override these
   * defaults through the application's SEO resolution layer.
   */
  seo: SiteSEOConfig;

  /**
   * Primary and additional locale configuration for the website.
   */
  locale: SiteLocaleConfig;

  /**
   * Optional platform feature enablement.
   */
  features?: SiteFeatures;
}
