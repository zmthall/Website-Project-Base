/**
 * Shared Action Contracts
 *
 * Provider-independent representation of user actions and destinations.
 */

/**
 * Shared Action Contracts
 *
 * Defines provider-independent representations of user-facing actions and
 * destinations used throughout the application.
 *
 * Actions describe what a user can activate and where that action leads
 * without coupling shared data to a particular Vue component or rendering
 * implementation.
 *
 * Consumers such as buttons, links, navigation items, cards, and sections
 * can interpret these contracts and determine the appropriate HTML,
 * Nuxt component, styling, accessibility behavior, and security behavior.
 */

/**
 * Describes the semantic visual importance of an action.
 *
 * This value represents intent rather than a specific component style.
 * Consuming components may interpret the intent differently depending on
 * their context, theme, or design.
 *
 * - `primary`   — The principal or highest-priority action in a context.
 * - `secondary` — A supporting action with less emphasis than the primary action.
 * - `text`      — A low-emphasis action generally presented as a text link.
 *
 * @example
 * ```ts
 * const intent: ActionIntent = 'primary';
 * ```
 */
export type ActionIntent = 'primary' | 'secondary' | 'text';

/**
 * Supported browsing contexts for actions that may open a destination
 * in another context.
 */
export type ActionTarget = '_blank' | '_self' | '_parent' | '_top';

/**
 * Properties shared by every action.
 *
 * `ActionBase` contains descriptive and presentation-independent metadata
 * common to all action types. It does not define a destination; destination
 * information is provided by the specialized action interfaces that extend it.
 *
 * This interface should remain independent of Vue components such as
 * `BaseButton` or `BaseLink`.
 */
export interface ActionBase {
  /**
   * Human-readable text describing the action.
   *
   * This will commonly become the visible text of a button or link.
   *
   * @example
   * `"View Services"`
   *
   * @example
   * `"Call Us"`
   */
  label?: string;

  /**
   * Optional identifier for an icon associated with the action.
   *
   * The value identifies the desired icon but does not prescribe how that
   * icon must be rendered. Interpretation belongs to the consuming component
   * or icon system.
   *
   * @example
   * `"phone"`
   *
   * @example
   * `"arrow-right"`
   */
  icon?: string;

  /**
   * Optional semantic presentation priority for the action.
   *
   * This describes the importance of the action rather than binding the
   * action to a specific button or link variant.
   *
   * @default undefined
   */
  intent?: ActionIntent;

  /**
   * Indicates that the action is configured as unavailable.
   *
   * Consuming components are responsible for translating this state into
   * appropriate visual, behavioral, and accessibility treatment.
   *
   * This property represents configured/static availability. Temporary
   * runtime states such as a form submitting should generally remain local
   * to the component or feature managing that state.
   *
   * @default false
   */
  disabled?: boolean;
}

/**
 * Primitive value supported by a named route parameter.
 *
 * Route parameters represent values used to construct dynamic route paths.
 * Boolean, null, and undefined values are intentionally excluded because
 * route parameters should identify concrete path segments.
 *
 * Examples include a service slug, article slug, location identifier,
 * category, or numeric record identifier.
 *
 * @example
 * ```ts
 * const slug: RouteParamPrimitive = 'window-replacement';
 * const id: RouteParamPrimitive = 42;
 * ```
 */
export type RouteParamPrimitive = string | number;

/**
 * Value accepted for an individual named route parameter.
 *
 * A route parameter may contain either a single primitive value or an array
 * of primitive values. Arrays allow the contract to represent routes such as
 * catch-all or multi-segment dynamic routes.
 *
 * @example
 * ```ts
 * const slug: RouteParamValue = 'window-replacement';
 * ```
 *
 * @example
 * ```ts
 * const path: RouteParamValue = ['services', 'windows', 'replacement'];
 * ```
 */
export type RouteParamValue = RouteParamPrimitive | RouteParamPrimitive[];

/**
 * Primitive value supported by a route query parameter.
 *
 * Query values are intentionally broader than route parameters because
 * query strings commonly represent optional filters, flags, pagination,
 * search terms, and other URL state.
 *
 * `null` may be used when a query key needs to be represented without a
 * meaningful scalar value.
 *
 * @example
 * ```ts
 * const page: RouteQueryPrimitive = 2;
 * const featured: RouteQueryPrimitive = true;
 * const category: RouteQueryPrimitive = 'windows';
 * ```
 */
export type RouteQueryPrimitive = string | number | boolean | null;

/**
 * Value accepted for an individual route query parameter.
 *
 * A query parameter may contain either one primitive value or an array of
 * primitive values when the same logical query field contains multiple
 * selections.
 *
 * @example
 * ```ts
 * const page: RouteQueryValue = 2;
 * ```
 *
 * @example
 * ```ts
 * const categories: RouteQueryValue = ['windows', 'doors'];
 * ```
 */
export type RouteQueryValue = RouteQueryPrimitive | RouteQueryPrimitive[];

/**
 * Describes navigation to an internal route by its route name.
 *
 * Named destinations are useful when the destination depends on dynamic
 * route parameters or query values rather than a manually constructed path.
 *
 * Simple internal destinations may instead be represented directly by a
 * string through `RouteAction.to`.
 *
 * @example
 * ```ts
 * const destination: NamedRouteDestination = {
 *   name: 'services-slug',
 *   params: {
 *     slug: 'window-replacement',
 *   },
 * };
 * ```
 *
 * @example
 * ```ts
 * const destination: NamedRouteDestination = {
 *   name: 'services',
 *   query: {
 *     category: 'windows',
 *     page: 2,
 *   },
 * };
 * ```
 */
export interface NamedRouteDestination {
  /**
   * Name of the internal application route.
   *
   * The name should correspond to a route known by the application's
   * routing system.
   */
  name: string;

  /**
   * Optional parameters used to populate dynamic segments of the route.
   *
   * @example
   * ```ts
   * {
   *   slug: 'window-replacement'
   * }
   * ```
   */
  params?: Record<string, RouteParamValue>;

  /**
   * Optional query parameters appended to the generated destination URL.
   *
   * @example
   * ```ts
   * {
   *   category: 'windows',
   *   featured: true,
   *   page: 2
   * }
   * ```
   */
  query?: Record<string, RouteQueryValue>;
}

/**
 * Represents navigation to another route within the current application.
 *
 * Use a `RouteAction` for destinations owned by the current site rather than
 * for external websites.
 *
 * `to` may contain a simple internal path:
 *
 * @example
 * ```ts
 * const action: RouteAction = {
 *   type: 'route',
 *   label: 'About Us',
 *   to: '/about',
 * };
 * ```
 *
 * Or a named destination when route parameters or query values are needed:
 *
 * @example
 * ```ts
 * const action: RouteAction = {
 *   type: 'route',
 *   label: 'Window Replacement',
 *   to: {
 *     name: 'services-slug',
 *     params: {
 *       slug: 'window-replacement',
 *     },
 *   },
 * };
 * ```
 */
export interface RouteAction extends ActionBase {
  /**
   * Discriminator identifying this action as internal route navigation.
   */
  type: 'route';

  /**
   * Internal destination for the action.
   *
   * Use a string for straightforward paths and a `NamedRouteDestination`
   * when named-route resolution, dynamic parameters, or query parameters
   * are required.
   */
  to: string | NamedRouteDestination;
}

/**
 * Represents navigation to a URL outside the current application.
 *
 * Use this action for third-party websites or other destinations that should
 * not be treated as internal application routes.
 *
 * Consuming components are responsible for enforcing appropriate security
 * behavior when opening external destinations, particularly when using
 * `target="_blank"`.
 *
 * @example
 * ```ts
 * const action: ExternalAction = {
 *   type: 'external',
 *   label: 'Visit Partner Website',
 *   href: 'https://example.com',
 *   target: '_blank',
 * };
 * ```
 */
export interface ExternalAction extends ActionBase {
  /**
   * Discriminator identifying this action as external navigation.
   */
  type: 'external';

  /**
   * Absolute or otherwise valid external destination URL.
   */
  href: string;

  /**
   * Optional browsing context in which the destination should open.
   *
   * Consumers should apply appropriate security attributes when opening
   * external links in a new browsing context.
   *
   * @default '_self'
   */
  target?: ActionTarget;
}

/**
 * Represents an action that initiates a telephone call.
 *
 * The stored value should represent the telephone destination itself rather
 * than requiring content configuration to construct a `tel:` URI.
 * The consuming component or action resolver can convert the value into the
 * appropriate link format.
 *
 * @example
 * ```ts
 * const action: PhoneAction = {
 *   type: 'phone',
 *   label: 'Call Us',
 *   value: '+17195551234',
 * };
 * ```
 */
export interface PhoneAction extends ActionBase {
  /**
   * Discriminator identifying this action as a telephone action.
   */
  type: 'phone';

  /**
   * Telephone number associated with the action.
   */
  value: string;
}

/**
 * Represents an action that initiates an email.
 *
 * The stored value should contain the email destination rather than a
 * preconstructed `mailto:` URI. The consuming component or action resolver
 * is responsible for generating the appropriate URI.
 *
 * @example
 * ```ts
 * const action: EmailAction = {
 *   type: 'email',
 *   label: 'Email Us',
 *   value: 'hello@example.com',
 * };
 * ```
 */
export interface EmailAction extends ActionBase {
  /**
   * Discriminator identifying this action as an email action.
   */
  type: 'email';

  /**
   * Email address associated with the action.
   */
  value: string;
}

/**
 * Represents navigation to an anchor destination.
 *
 * Use an anchor action for navigation to a specific section or element,
 * typically within the current document.
 *
 * @example
 * ```ts
 * const action: AnchorAction = {
 *   type: 'anchor',
 *   label: 'View Services',
 *   href: '#services',
 * };
 * ```
 */
export interface AnchorAction extends ActionBase {
  /**
   * Discriminator identifying this action as anchor navigation.
   */
  type: 'anchor';

  /**
   * Anchor destination.
   *
   * Typically contains a fragment identifier such as `#services`.
   */
  href: string;
}

/**
 * Represents an action for accessing a downloadable resource.
 *
 * Use this action for documents, images, archives, or other resources that
 * should be treated as downloads rather than ordinary navigation.
 *
 * @example
 * ```ts
 * const action: DownloadAction = {
 *   type: 'download',
 *   label: 'Download Brochure',
 *   href: '/documents/brochure.pdf',
 *   filename: 'company-brochure.pdf',
 * };
 * ```
 */
export interface DownloadAction extends ActionBase {
  /**
   * Discriminator identifying this action as a download.
   */
  type: 'download';

  /**
   * URL or path of the downloadable resource.
   */
  href: string;

  /**
   * Optional suggested filename for the downloaded resource.
   *
   * When omitted, the browser or consuming implementation may derive the
   * filename from the resource itself.
   */
  filename?: string;
}

/**
 * Union of every user-facing action supported by the shared action contract.
 *
 * The `type` property acts as the discriminant, allowing TypeScript to narrow
 * an `Action` to its corresponding specialized interface.
 *
 * @example
 * ```ts
 * function getDestination(action: Action) {
 *   switch (action.type) {
 *     case 'route':
 *       return action.to;
 *
 *     case 'external':
 *     case 'anchor':
 *     case 'download':
 *       return action.href;
 *
 *     case 'phone':
 *       return `tel:${action.value}`;
 *
 *     case 'email':
 *       return `mailto:${action.value}`;
 *   }
 * }
 * ```
 *
 * This union should remain independent of specific Vue components. Rendering
 * behavior belongs to consumers such as navigation, buttons, links, cards,
 * sections, and feature components.
 */
export type Action =
  RouteAction | ExternalAction | PhoneAction | EmailAction | AnchorAction | DownloadAction;
