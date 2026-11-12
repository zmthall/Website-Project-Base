/**
 * Shared Business Contracts
 *
 * Defines provider-independent business information used throughout
 * the website.
 *
 * These contracts describe configured business data only. Calculated
 * state such as whether a location is currently open belongs in
 * application logic rather than these shared contracts.
 */

import type { ImageMedia } from './image';
import type { AggregateRating } from './rating';
import type { SocialLink } from './social';

/**
 * Public contact information associated with a business or location.
 */
export interface BusinessContact {
  /**
   * Public telephone number.
   *
   * Prefer a normalized international representation when practical.
   *
   * @example "+17195551234"
   */
  phone?: string;

  /**
   * Public email address.
   */
  email?: string;

  /**
   * Public fax number.
   */
  fax?: string;
}

/**
 * Represents a postal address.
 *
 * Field names are intentionally provider-independent and suitable for
 * both domestic and international addresses.
 */
export interface Address {
  /**
   * Primary street-address line.
   */
  line1: string;

  /**
   * Optional secondary address information such as a suite or unit.
   */
  line2?: string;

  /**
   * City, town, municipality, or other locality.
   */
  locality: string;

  /**
   * State, province, territory, or other administrative region.
   */
  region?: string;

  /**
   * Postal or ZIP code.
   */
  postalCode?: string;

  /**
   * ISO 3166-1 alpha-2 country code.
   *
   * @example "US"
   * @example "CA"
   */
  countryCode: string;
}

/**
 * Supported days of the week.
 */
export type DayOfWeek =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Represents one continuous period during which a business location
 * is open.
 */
export interface HoursPeriod {
  /**
   * Opening time in local 24-hour `HH:mm` format.
   *
   * @example "08:00"
   */
  opens: string;

  /**
   * Closing time in local 24-hour `HH:mm` format.
   *
   * @example "17:00"
   */
  closes: string;
}

/**
 * Represents regular operating periods for one day of the week.
 *
 * Multiple periods support businesses that close and reopen during
 * the same day. An empty `periods` array represents a closed day.
 */
export interface DailyHours {
  /**
   * Day represented by this schedule.
   */
  day: DayOfWeek;

  /**
   * Opening periods for the day.
   */
  periods: HoursPeriod[];
}

/**
 * Represents a date-specific exception to regular business hours.
 *
 * An empty `periods` array represents closure for the entire date.
 */
export interface SpecialHours {
  /**
   * Calendar date in `YYYY-MM-DD` format.
   *
   * @example "2026-12-25"
   */
  date: string;

  /**
   * Opening periods that replace the regular schedule for this date.
   *
   * Use an empty array when the business is closed.
   */
  periods: HoursPeriod[];

  /**
   * Optional public-facing explanation.
   *
   * @example "Christmas Day"
   * @example "Holiday Hours"
   */
  label?: string;
}

/**
 * Configured regular and exceptional operating hours.
 */
export interface BusinessHours {
  /**
   * Regular weekly operating schedule.
   */
  regular: DailyHours[];

  /**
   * Optional date-specific exceptions to the regular schedule.
   */
  special?: SpecialHours[];
}

/**
 * Describes a geographic area served by the business.
 *
 * This contract intentionally represents service areas descriptively
 * rather than introducing radius, coordinate, or GIS requirements.
 */
export interface ServiceArea {
  /**
   * Public-facing name of the service area.
   *
   * @example "Southern Colorado"
   * @example "Denver Metro"
   */
  name: string;

  /**
   * Optional cities, towns, municipalities, or other localities included
   * in the service area.
   */
  localities?: string[];

  /**
   * Optional postal or ZIP codes included in the service area.
   */
  postalCodes?: string[];
}

/**
 * Represents one physical or operational business location.
 */
export interface BusinessLocation {
  /**
   * Stable application identifier for the location.
   */
  id: string;

  /**
   * Public-facing location name.
   *
   * @example "Pueblo"
   * @example "Downtown Denver"
   */
  name: string;

  /**
   * Indicates the primary location when multiple locations exist.
   *
   * @default false
   */
  primary?: boolean;

  /**
   * Public postal address of the location.
   */
  address?: Address;

  /**
   * Public contact information specific to this location.
   */
  contact?: BusinessContact;

  /**
   * IANA timezone identifier used when interpreting location-specific
   * dates and operating hours.
   *
   * @example "America/Denver"
   */
  timezone: string;

  /**
   * Operating hours for the location.
   */
  hours?: BusinessHours;

  /**
   * Geographic areas served specifically by this location.
   */
  serviceAreas?: ServiceArea[];

  /**
   * Aggregate public rating associated specifically with this location.
   */
  rating?: AggregateRating;
}

/**
 * Represents the public business identity used throughout the website.
 */
export interface Business {
  /**
   * Public-facing business name.
   */
  name: string;

  /**
   * Optional registered or legal business name.
   */
  legalName?: string;

  /**
   * Business-wide public contact information.
   */
  contact?: BusinessContact;

  /**
   * Primary business logo.
   */
  logo?: ImageMedia;

  /**
   * Optional compact logo for constrained layouts.
   */
  logoCompact?: ImageMedia;

  /**
   * Public social and professional profiles.
   */
  socials?: SocialLink[];

  /**
   * Physical or operational business locations.
   *
   * Single-location and multi-location businesses use the same
   * collection model.
   */
  locations?: BusinessLocation[];

  /**
   * Geographic areas served by the business as a whole.
   */
  serviceAreas?: ServiceArea[];

  /**
   * Aggregate public rating associated with the business as a whole.
   */
  rating?: AggregateRating;
}
