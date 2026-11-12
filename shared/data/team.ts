/**
 * Team Data
 *
 * Central source for public-facing team-member information.
 *
 * Only information explicitly intended for public display should be
 * included here. Private contact information, employment records,
 * internal identifiers, schedules, compensation, authentication data,
 * and other private employee information do not belong in this file.
 *
 * Filtering, sorting behavior, and presentation logic belong outside
 * the shared team data.
 */

import type { TeamMember } from '../types/team';

/**
 * Public-facing team members for the current website.
 *
 * Required fields:
 * - `id`
 * - `name`
 * - `role`
 *
 * Biography, imagery, credentials, public contact information, social
 * profiles, featured status, and explicit ordering are optional.
 */
export const team = [
  {
    /**
     * Stable identifier that should not depend on the person's current
     * role or display order.
     */
    id: 'team-member-one',

    /**
     * Optional slug when individual profile pages are supported.
     */
    slug: 'team-member-one',

    name: 'Team Member One',
    role: 'Position or Role',

    summary: 'A short public introduction for use in team cards and condensed layouts.',

    biography: 'Replace this with the team member’s approved public biography.',

    /**
     * Optional public profile image.
     */
    // image: {
    //   src: '/images/team/team-member-one.jpg',
    //   alt: 'Team Member One',
    // },

    /**
     * Optional publicly relevant credentials or qualifications.
     */
    credentials: ['Example Credential'],

    /**
     * Include only contact information intended for public display.
     */
    // contact: {
    //   phone: '+10000000000',
    //   email: 'public@example.com',
    // },

    /**
     * Optional public social or professional profiles.
     */
    // socials: [
    //   {
    //     platform: 'linkedin',
    //     href: 'https://www.linkedin.com/in/example',
    //     label: 'Connect on LinkedIn',
    //   },
    // ],

    featured: true,
    order: 1,
  },

  {
    id: 'team-member-two',
    name: 'Team Member Two',
    role: 'Position or Role',

    summary: 'A short public introduction for use in team cards and condensed layouts.',

    order: 2,
  },
] satisfies TeamMember[];
