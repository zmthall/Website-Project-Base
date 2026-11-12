/**
 * Shared Team Member Contracts
 *
 * Defines public-facing team-member information used by team listings,
 * profile content, and other public website experiences.
 *
 * Private employment, HR, authentication, compensation, scheduling,
 * and other internal employee information must not be stored in this
 * contract.
 */

import type { BusinessContact } from './business';
import type { ImageMedia } from './image';
import type { SocialLink } from './social';

/**
 * Represents a public-facing member of the business team.
 */
export interface TeamMember {
  /**
   * Stable application identifier for the team member.
   *
   * This should remain stable even if the person's name, role, or profile
   * URL changes.
   */
  id: string;

  /**
   * Optional URL-friendly identifier used when individual team-member
   * profile pages are supported.
   *
   * This is optional because many websites display team members only
   * within shared team listings.
   */
  slug?: string;

  /**
   * Public-facing name.
   */
  name: string;

  /**
   * Professional title or role.
   *
   * @example "General Manager"
   */
  role: string;

  /**
   * Short public-facing biography or introduction.
   *
   * Intended for cards, listings, and other condensed contexts.
   */
  summary?: string;

  /**
   * Full public-facing biography.
   *
   * The initial contract uses plain text. If the platform later adopts
   * a shared rich-content representation, this property may be expanded
   * to support that contract.
   */
  biography?: string;

  /**
   * Public profile image.
   */
  image?: ImageMedia;

  /**
   * Public professional credentials, qualifications, certifications,
   * licenses, or other relevant distinctions.
   *
   * @example
   * ["CPA", "LEAD AP"]
   */
  credentials?: string[];

  /**
   * Public contact information for the team member.
   *
   * Only contact information explicitly intended for publication should
   * be included.
   */
  contact?: BusinessContact;

  /**
   * Public social or professional profiles.
   */
  socials?: SocialLink[];

  /**
   * Indicates that the team member should receive featured editorial
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
   * Static team collections should generally rely on array order.
   */
  order?: number;
}
