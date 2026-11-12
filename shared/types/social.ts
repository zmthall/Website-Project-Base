/**
 * Shared Social Contracts
 *
 * Defines provider-independent links to public social, professional,
 * or other external profiles.
 *
 * These contracts describe profile identity and destination only.
 * Rendering behavior, icons, tracking, and presentation belong to
 * consuming components.
 */

/**
 * Represents a public social or professional profile.
 *
 * The platform identifier is intentionally open-ended so new services
 * can be supported without modifying the shared contract.
 */
export interface SocialLink {
  /**
   * Platform or service identifier.
   *
   * Prefer stable lowercase identifiers where practical.
   *
   * @example "facebook"
   * @example "instagram"
   * @example "linkedin"
   * @example "youtube"
   */
  platform: string;

  /**
   * Public URL of the profile.
   *
   * @example "https://www.linkedin.com/company/example"
   */
  href: string;

  /**
   * Optional public-facing or accessible label.
   *
   * Consuming components may generate an appropriate label when this
   * value is omitted.
   *
   * @example "Follow us on Instagram"
   */
  label?: string;
}
