/**
 * Shared Image Contracts
 *
 * Provider-independent representation of image content and image rendering
 * preferences used throughout the application.
 *
 * These contracts are designed to work naturally with Nuxt Image while
 * remaining independent of Nuxt Image, a specific CDN, or an image provider.
 */

/**
 * Determines when an image should be loaded by the browser.
 *
 * - `lazy`  — Defers loading until the image approaches the viewport.
 * - `eager` — Requests the image immediately.
 */
export type ImageLoading = 'lazy' | 'eager';

/**
 * Indicates the relative priority of an image request.
 *
 * This corresponds conceptually to the browser's `fetchpriority` behavior
 * and can be used by image components for performance-sensitive imagery.
 *
 * `high` should be reserved for imagery that is important to the initial
 * viewport, such as a primary hero image.
 */
export type ImageFetchPriority = 'high' | 'low' | 'auto';

/**
 * Represents a normalized position within an image.
 *
 * Values range from `0` to `1`:
 *
 * - `0` represents the top or left edge.
 * - `0.5` represents the center.
 * - `1` represents the bottom or right edge.
 *
 * Focal points allow consuming components or image providers to preserve
 * an important part of an image when cropping or repositioning it.
 */
export interface ImageFocalPoint {
  x: number;
  y: number;
}

/**
 * Describes preferred crop behavior for an image.
 *
 * Crop metadata expresses content intent rather than provider-specific
 * transformation syntax. The consuming image component may translate this
 * information into CSS or provider-supported image transformations.
 */
export interface ImageCrop {
  /**
   * Preferred aspect ratio for the cropped image.
   *
   * @example
   * `"16/9"`
   *
   * @example
   * `"1/1"`
   */
  aspectRatio?: string;

  /**
   * Optional focal point that should remain visible when the image is cropped.
   */
  focalPoint?: ImageFocalPoint;
}

/**
 * Attribution information associated with an image.
 */
export interface ImageAttribution {
  /**
   * Human-readable attribution or credit.
   *
   * @example
   * `"Photo by Jane Smith"`
   */
  text: string;

  /**
   * Optional URL associated with the attribution.
   */
  href?: string;
}

/**
 * Shared representation of an image used throughout the application.
 *
 * `ImageMedia` stores the content and rendering preferences required by the
 * application without coupling shared data to Nuxt Image or a particular
 * image CDN.
 *
 * Components such as `AppImage` may translate this contract into `<NuxtImg>`
 * properties and provider-specific behavior.
 */
export interface ImageMedia {
  /**
   * Source path or URL of the image.
   *
   * This may reference a local/public application asset or a remote image
   * supported by the configured image infrastructure.
   *
   * @example
   * `"/images/services/window-replacement.jpg"`
   */
  src: string;

  /**
   * Alternative text describing the meaningful content or purpose of the
   * image.
   *
   * Decorative images should explicitly set `decorative: true` rather than
   * relying on an omitted `alt` value to communicate decorative intent.
   */
  alt: string;

  /**
   * Explicitly identifies an image as decorative.
   *
   * Consuming components should render decorative imagery with appropriate
   * accessibility behavior, such as an empty `alt` attribute.
   *
   * @default false
   */
  decorative?: boolean;

  /**
   * Optional intrinsic width of the source image in pixels.
   *
   * Supplying intrinsic dimensions helps reserve layout space and reduce
   * cumulative layout shift.
   */
  width?: number;

  /**
   * Optional intrinsic height of the source image in pixels.
   *
   * Supplying intrinsic dimensions helps reserve layout space and reduce
   * cumulative layout shift.
   */
  height?: number;

  /**
   * Responsive image sizes declaration.
   *
   * This describes the expected rendered width of the image at different
   * viewport sizes and may be passed or translated to Nuxt Image's responsive
   * sizing behavior.
   *
   * @example
   * `"100vw sm:50vw lg:33vw"`
   */
  sizes?: string;

  /**
   * Preferred image quality.
   *
   * The consuming image implementation may pass this value to Nuxt Image or
   * another optimization provider.
   *
   * Values are generally expected to represent a percentage-like quality
   * setting, such as `80`.
   */
  quality?: number;

  /**
   * Browser loading strategy for the image.
   *
   * Most non-critical imagery should use lazy loading. Images important to
   * the initial viewport may use eager loading when appropriate.
   *
   * @default 'lazy'
   */
  loading?: ImageLoading;

  /**
   * Relative browser fetch priority for the image.
   *
   * High priority should be used sparingly and primarily for images that are
   * important to the initial render.
   *
   * @default 'auto'
   */
  fetchPriority?: ImageFetchPriority;

  /**
   * Optional crop and focal-point metadata.
   */
  crop?: ImageCrop;

  /**
   * Optional human-readable caption associated with the image.
   */
  caption?: string;

  /**
   * Optional attribution or credit information for the image.
   */
  attribution?: ImageAttribution;
}
