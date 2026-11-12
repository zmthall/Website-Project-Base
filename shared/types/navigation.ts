/**
 * Shared Navigation Contracts
 *
 * Defines provider-independent navigation structures used throughout
 * the application.
 *
 * Navigation contracts describe navigation content and hierarchy only.
 * Runtime UI state such as active, expanded, hovered, focused, or
 * responsive-menu state belongs to consuming components or composables.
 */

import type { Action } from './action';

/**
 * Controls whether a navigation item should be included in configured
 * navigation.
 *
 * Visibility represents static/configured availability rather than
 * responsive or runtime UI state.
 *
 * - `always` — The item is available wherever the navigation structure
 *   is rendered.
 * - `authenticated` — The item is intended for authenticated users.
 * - `guest` — The item is intended for unauthenticated users.
 *
 * Consumers are responsible for interpreting authentication-dependent
 * visibility when the authentication feature is enabled.
 */
export type NavigationVisibility = 'always' | 'authenticated' | 'guest';

/**
 * Represents a single item within a navigation structure.
 *
 * A navigation item may be directly actionable, contain nested child
 * navigation items, or provide both a destination and child navigation.
 *
 * The destination is represented using the shared `Action` contract so
 * navigation remains independent of NuxtLink, anchor elements, or other
 * rendering implementations.
 *
 * @example
 * ```ts
 *   const item: NavigationItem = {
 *   label: 'About',
 *   action: {
 *       type: 'route',
 *       to: '/about',
 *      },
 *   };
 * ```
 *
 * @example
 * ```ts
 * const item: NavigationItem = {
 *   label: 'Services',
 *   action: {
 *       type: 'route',
 *       to: '/services',
 *   },
 *   children: [
 *       {
 *       label: 'Window Replacement',
 *       action: {
 *           type: 'route',
 *           to: '/services/windows',
 *          },
 *       },
 *     ],
 *   };
 * ```
 */
export interface NavigationItem {
  /**
   * Public-facing navigation label.
   *
   * This is the text normally displayed by menus, navigation bars,
   * breadcrumbs, drawers, or similar navigation interfaces.
   *
   * @example "Services"
   */
  label: string;

  /**
   * Optional action performed when the navigation item is activated.
   *
   * This may be omitted when the item exists only to organize child
   * navigation entries.
   */
  action?: Action;

  /**
   * Optional icon associated with the navigation item.
   *
   * The value identifies an icon but does not prescribe how the icon
   * is rendered.
   *
   * @example "home"
   *
   * @example "phone"
   */
  icon?: string;

  /**
   * Optional supporting description.
   *
   * Descriptions are useful for richer navigation interfaces such as
   * mega menus, cards, drawers, or grouped navigation.
   *
   * Simple navigation components may choose not to display this value.
   *
   * @example
   * "Explore our residential and commercial services."
   */
  description?: string;

  /**
   * Optional nested navigation items.
   *
   * Children allow hierarchical navigation structures such as dropdowns,
   * submenus, and mega menus.
   *
   * Consumers determine how nested navigation is presented.
   */
  children?: NavigationItem[];

  /**
   * Optional explicit display order.
   *
   * This is useful when navigation data originates from a source whose
   * natural array order cannot be relied upon.
   *
   * When omitted, consumers should generally preserve the order in which
   * navigation items are provided.
   */
  order?: number;

  /**
   * Optional configured visibility rule.
   *
   * This represents content/configuration visibility only. It should not
   * be used for viewport, hover, expanded, or other runtime UI state.
   *
   * @default 'always'
   */
  visibility?: NavigationVisibility;
}

/**
 * Represents a logical group of navigation items.
 *
 * Groups are useful when a navigation interface contains distinct
 * collections of links, such as footer columns or sections within a
 * larger navigation menu.
 *
 * A group does not represent a destination itself. Individual navigation
 * items within the group define their own actions.
 *
 * @example
 * ```ts
 *   const group: NavigationGroup = {
 *      label: 'Company',
 *          items: [
 *            {
 *              {
 *                label: 'About Us',
 *                action: {
 *                  type: 'route',
 *                  to: '/about',
 *                },
 *              },
 *            {
 *              label: 'Careers',
 *              action: {
 *                type: 'route',
 *                to: '/careers',
 *              },
 *            },
 *          ],
 *              label: 'About Us',
 *              action: {
 *                type: 'route',
 *                to: '/about',
 *              },
 *            },
 *            {
 *              label: 'Careers',
 *              action: {
 *                type: 'route',
 *                to: '/careers',
 *              },
 *            },
 *          ],
 *        };
 * ```
 */
export interface NavigationGroup {
  /**
   * Optional public-facing heading for the group.
   *
   * A label is optional because some navigation layouts may group items
   * structurally without displaying a heading.
   *
   * @example "Company"
   */
  label?: string;

  /**
   * Optional supporting description for the navigation group.
   *
   * This may be useful in large or content-rich navigation interfaces.
   */
  description?: string;

  /**
   * Navigation items contained within the group.
   */
  items: NavigationItem[];

  /**
   * Optional explicit display order for the group.
   *
   * When omitted, consumers should generally preserve the order in which
   * groups are provided.
   */
  order?: number;
}
