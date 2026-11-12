/**
 * Shared Service Contracts
 *
 * Defines provider-independent service content used by service listings,
 * cards, navigation, search, and service detail pages.
 *
 * Service contracts describe the service itself. Pricing, booking,
 * estimate workflows, and presentation-specific configuration belong
 * outside the core service contract.
 */

import type { Action } from './action';
import type { ImageMedia } from './image';
import type { SEO } from './seo';

/**
 * Represents a service offered by the business.
 */
export interface Service {
  /**
   * Stable application identifier for the service.
   *
   * This should remain stable even if the service name or URL changes.
   *
   * @example "window-replacement"
   */
  id: string;

  /**
   * URL-friendly identifier used for the service detail route.
   *
   * @example "window-replacement"
   */
  slug: string;

  /**
   * Public-facing service name.
   *
   * @example "Window Replacement"
   */
  name: string;

  /**
   * Short description of the service.
   *
   * Intended for cards, listings, search results, and introductory
   * content.
   */
  summary: string;

  /**
   * Optional full service description.
   *
   * The initial contract uses plain text. If the platform later adopts
   * a shared rich-content representation, this property may be expanded
   * to support that contract.
   */
  description?: string;

  /**
   * Primary image associated with the service.
   */
  image?: ImageMedia;

  /**
   * Optional icon identifier associated with the service.
   *
   * The value identifies an icon without prescribing how the icon is
   * rendered.
   */
  icon?: string;

  /**
   * Actions associated with the service.
   *
   * Examples include viewing additional information, contacting the
   * business, or beginning an estimate request.
   */
  actions?: Action[];

  /**
   * Optional category or grouping identifier.
   *
   * This remains a lightweight identifier until the platform has a
   * concrete need for a dedicated service-category contract.
   *
   * @example "residential"
   * @example "commercial"
   */
  category?: string;

  /**
   * Indicates that the service should receive featured editorial
   * treatment where supported.
   *
   * This describes content importance rather than a particular visual
   * presentation.
   *
   * @default false
   */
  featured?: boolean;

  /**
   * Optional explicit ordering value.
   *
   * Static service collections should generally rely on array order.
   */
  order?: number;

  /**
   * SEO metadata for the service detail page.
   *
   * Site-wide defaults are resolved separately by the SEO layer.
   */
  seo?: SEO;
}
