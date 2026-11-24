/**
 * Navigation Data
 *
 * Central source for configured site navigation structures and
 * navigation-related actions.
 *
 * This file is one of the primary configuration points when creating
 * a new client site. Route destinations should remain centralized here
 * rather than being duplicated throughout navigation components.
 *
 * Active-route state, expanded menus, responsive behavior, hover state,
 * and other runtime navigation state belong to components or composables.
 */

import type { Action } from '../types/action';
import type { NavigationGroup, NavigationItem } from '../types/navigation';

/**
 * Primary navigation displayed by the site's main navigation interface.
 *
 * Array order defines the normal display order. The optional `order`
 * property is only necessary when navigation data is assembled from
 * sources where array order cannot be relied upon.
 */
export const primaryNavigation = [
  { label: 'About', action: { type: 'route', to: '/about' } },
  { label: 'Services', action: { type: 'route', to: '/services' } },
  { label: 'Events', action: { type: 'route', to: '/events' } },
  { label: 'Blog', action: { type: 'route', to: '/blog' } },
  { label: 'Resources', action: { type: 'route', to: '/articles' } },
  { label: 'Search', action: { type: 'route', to: '/search' } },
  { label: 'Showcase', action: { type: 'route', to: '/showcase' } },
  {
    label: 'Sign in / Register',
    action: { type: 'route', to: '/customer/login' },
    visibility: 'guest',
  },
  { label: 'My account', action: { type: 'route', to: '/customer' }, visibility: 'authenticated' },
] satisfies NavigationItem[];

/**
 * Grouped footer navigation.
 *
 * Footer groups allow the site shell to render logical columns without
 * embedding client-specific navigation structures in the footer
 * component itself.
 */
export const footerNavigation = [
  {
    label: 'Company',
    items: [
      { label: 'Estimates', action: { type: 'route', to: '/estimates' } },
      { label: 'Appointments', action: { type: 'route', to: '/appointments' } },
      {
        label: 'About',
        action: {
          type: 'route',
          to: '/about',
        },
      },
      {
        label: 'Contact',
        action: {
          type: 'route',
          to: '/contact',
        },
      },
      {
        label: 'Careers',
        action: {
          type: 'route',
          to: '/careers',
        },
      },
    ],
  },

  {
    label: 'Services',
    items: [
      {
        label: 'All Services',
        action: {
          type: 'route',
          to: '/services',
        },
      },
      {
        label: 'Service One',
        action: {
          type: 'route',
          to: '/services/service-0',
        },
      },
      {
        label: 'Service Two',
        action: {
          type: 'route',
          to: '/services/service-1',
        },
      },
    ],
  },

  {
    label: 'Resources',
    items: [
      { label: 'Reviews', action: { type: 'route', to: '/reviews' } },
      { label: 'Newsletter', action: { type: 'route', to: '/newsletter' } },
      {
        label: 'Articles',
        action: {
          type: 'route',
          to: '/articles',
        },
      },
      {
        label: 'FAQs',
        action: {
          type: 'route',
          to: '/faq',
        },
      },
    ],
  },

  {
    label: 'Legal',
    items: [
      {
        label: 'Privacy Policy',
        action: {
          type: 'route',
          to: '/privacy',
        },
      },
      {
        label: 'Terms of Use',
        action: {
          type: 'route',
          to: '/terms',
        },
      },
    ],
  },
] satisfies NavigationGroup[];

/**
 * Optional primary call-to-action associated with the site header.
 *
 * This remains separate from primary navigation because it represents
 * an emphasized action rather than part of the site's navigational
 * hierarchy.
 *
 * Components may choose whether and where to render this action.
 */
export const headerAction = {
  type: 'route',
  to: '/contact',
  label: 'Get Started',
  intent: 'primary',
} satisfies Action;

/**
 * Optional call-to-action associated with the site footer.
 *
 * Remove or replace this action when the client does not require a
 * footer-specific call-to-action.
 */
export const footerAction = {
  type: 'route',
  to: '/contact',
  label: 'Contact Us',
  intent: 'primary',
} satisfies Action;
