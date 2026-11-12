// TODO [CONTENT-01]: Replace template identity, origin, example contacts/assets/testimonials/services and demo article sources with approved client content before enabling production indexing. See docs/integration-audit.md.
/**
 * Business Data
 *
 * Central source for the website's public business identity, contact
 * information, locations, operating hours, service areas, social
 * profiles, ratings, and business imagery.
 *
 * This file is one of the primary configuration points when creating
 * a new client site. Replace the placeholder values with accurate,
 * publicly available information for the configured business.
 *
 * Presentation formatting, calculated business state, private business
 * information, and provider-specific data do not belong here.
 */

import type { Business } from '../types/business';

/**
 * Public business information for the current website.
 *
 * When configuring a new client site, commonly updated values include:
 *
 * - Business and legal names
 * - Phone numbers and email addresses
 * - Logos
 * - Social profiles
 * - Locations and addresses
 * - Operating hours
 * - Service areas
 * - Public rating information
 *
 * Rating information should only be included when it can be maintained
 * from a reliable source.
 */
export const business = {
  /**
   * Primary public-facing business name.
   */
  name: 'Lorem & Co.',

  /**
   * Registered or legal business name when different from the
   * public-facing name.
   *
   * Remove this property when it is not required.
   */
  // legalName: 'Business Name, LLC',

  /**
   * Business-wide public contact information.
   *
   * Location-specific contact information belongs on the corresponding
   * location instead.
   */
  contact: {
    phone: '+10000000000',
    email: 'info@example.com',
  },

  /**
   * Primary business logo.
   *
   * Replace this placeholder with the client's actual logo asset.
   */
  // logo: {
  //   src: '/images/brand/logo.svg',
  //   alt: 'Business Name',
  // },

  /**
   * Optional compact logo for constrained layouts such as mobile
   * navigation or compact headers.
   */
  // logoCompact: {
  //   src: '/images/brand/logo-compact.svg',
  //   alt: 'Business Name',
  // },

  /**
   * Public social and professional profiles.
   *
   * Remove platforms that are not used by the client and add additional
   * platforms as required.
   */
  socials: [
    // {
    //   platform: 'facebook',
    //   href: 'https://www.facebook.com/example',
    //   label: 'Follow us on Facebook',
    // },
    // {
    //   platform: 'instagram',
    //   href: 'https://www.instagram.com/example',
    //   label: 'Follow us on Instagram',
    // },
  ],

  /**
   * Physical or operational business locations.
   *
   * Single-location and multi-location businesses use the same
   * collection structure.
   */
  locations: [
    {
      /**
       * Stable internal identifier for this location.
       */
      id: 'primary',

      /**
       * Public-facing location name.
       *
       * Use something meaningful such as the city, neighborhood, or
       * branch name.
       */
      name: 'Primary Location',

      /**
       * Identifies the primary location when multiple locations exist.
       */
      primary: true,

      /**
       * Public postal address.
       */
      address: {
        line1: '123 Example Street',
        locality: 'Example City',
        region: 'CO',
        postalCode: '00000',
        countryCode: 'US',
      },

      /**
       * Location-specific public contact information.
       *
       * Remove this property when the location uses only the business-wide
       * contact information.
       */
      // contact: {
      //   phone: '+10000000000',
      //   email: 'location@example.com',
      // },

      /**
       * IANA timezone used for location-specific dates and hours.
       */
      timezone: 'America/Denver',

      /**
       * Regular and exceptional operating hours.
       *
       * Multiple periods may be supplied for a single day. An empty
       * periods array represents a closed day.
       */
      hours: {
        regular: [
          {
            day: 'monday',
            periods: [
              {
                opens: '08:00',
                closes: '17:00',
              },
            ],
          },
          {
            day: 'tuesday',
            periods: [
              {
                opens: '08:00',
                closes: '17:00',
              },
            ],
          },
          {
            day: 'wednesday',
            periods: [
              {
                opens: '08:00',
                closes: '17:00',
              },
            ],
          },
          {
            day: 'thursday',
            periods: [
              {
                opens: '08:00',
                closes: '17:00',
              },
            ],
          },
          {
            day: 'friday',
            periods: [
              {
                opens: '08:00',
                closes: '17:00',
              },
            ],
          },
          {
            day: 'saturday',
            periods: [],
          },
          {
            day: 'sunday',
            periods: [],
          },
        ],

        /**
         * Date-specific hours that replace the regular schedule.
         *
         * An empty periods array represents closure for the entire date.
         *
         * Add entries only when required.
         */
        // special: [
        //   {
        //     date: '2026-12-25',
        //     periods: [],
        //     label: 'Christmas Day',
        //   },
        // ],
      },

      /**
       * Geographic areas served specifically by this location.
       *
       * Remove this property when service areas are defined only at the
       * business level.
       */
      // serviceAreas: [
      //   {
      //     name: 'Example Metro Area',
      //     localities: [
      //       'Example City',
      //       'Another City',
      //     ],
      //   },
      // ],

      /**
       * Aggregate rating specifically associated with this location.
       *
       * Only configure rating information when backed by a reliable,
       * maintainable source.
       */
      // rating: {
      //   value: 4.8,
      //   scale: 5,
      //   ratingCount: 125,
      //   reviewCount: 100,
      // },
    },
  ],

  /**
   * Geographic areas served by the business as a whole.
   *
   * Location-specific service areas may instead be configured on
   * individual business locations.
   */
  // serviceAreas: [
  //   {
  //     name: 'Southern Colorado',
  //     localities: [
  //       'Pueblo',
  //       'Colorado Springs',
  //     ],
  //   },
  // ],

  /**
   * Aggregate rating associated with the business as a whole.
   *
   * Do not manually add or maintain rating values unless they are backed
   * by a reliable source and can be kept current.
   */
  // rating: {
  //   value: 4.8,
  //   scale: 5,
  //   ratingCount: 250,
  //   reviewCount: 200,
  // },
} satisfies Business;
