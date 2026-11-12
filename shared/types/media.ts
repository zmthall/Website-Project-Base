/**
 * Shared Media Contracts
 *
 * Defines provider-independent representations of media content used
 * throughout the application.
 *
 * Media contracts provide a common way for components, blocks, sections,
 * and shared data to reference different forms of media without coupling
 * content to a specific Vue component, media provider, CDN, or embed service.
 *
 * Image-specific configuration is defined in `image.ts` and reused here.
 */

import type { ImageMedia } from './image';

/**
 * Determines how a video should be loaded by the browser.
 *
 * - `none`     — Does not preload video data.
 * - `metadata` — Loads only metadata such as duration and dimensions.
 * - `auto`     — Allows the browser to preload the video as appropriate.
 */
export type VideoPreload = 'none' | 'metadata' | 'auto';

/**
 * Describes a source file available for a video.
 *
 * Multiple sources may be supplied when the same video is available in
 * different formats. The browser or consuming component can select the
 * most appropriate supported source.
 *
 * @example
 * ```ts
 * const source: VideoSource = {
 *   src: '/videos/hero.webm',
 *   type: 'video/webm',
 * };
 * ```
 */
export interface VideoSource {
  /**
   * Path or URL of the video source.
   */
  src: string;

  /**
   * Optional MIME type of the video source.
   *
   * Supplying the MIME type can help the browser determine whether it
   * supports a source without downloading it first.
   *
   * @example
   * `"video/webm"`
   *
   * @example
   * `"video/mp4"`
   */
  type?: string;
}

/**
 * Represents a video file controlled directly by the application.
 *
 * Use `VideoMedia` for self-hosted, CDN-hosted, or otherwise directly
 * accessible video files.
 *
 * Third-party embedded videos should use `EmbeddedVideoMedia` instead.
 *
 * @example
 * ```ts
 * const video: VideoMedia = {
 *   kind: 'video',
 *   sources: [
 *     {
 *       src: '/videos/hero.webm',
 *       type: 'video/webm',
 *     },
 *     {
 *       src: '/videos/hero.mp4',
 *       type: 'video/mp4',
 *     },
 *   ],
 *   poster: {
 *     src: '/images/hero-poster.jpg',
 *     alt: 'Technician installing a replacement window',
 *   },
 *   controls: true,
 *   preload: 'metadata',
 * };
 * ```
 */
export interface VideoMedia {
  /**
   * Discriminator identifying this media as a directly accessible video.
   */
  kind: 'video';

  /**
   * One or more available video sources.
   *
   * Sources may represent alternative formats of the same video.
   */
  sources: VideoSource[];

  /**
   * Optional image displayed before the video begins playing.
   *
   * The shared `ImageMedia` contract is reused so poster imagery receives
   * the same accessibility, sizing, optimization, caption, and attribution
   * capabilities as other application images.
   */
  poster?: ImageMedia;

  /**
   * Indicates whether native or application-provided playback controls
   * should be available.
   *
   * @default true
   */
  controls?: boolean;

  /**
   * Indicates whether playback should begin automatically when permitted
   * by the browser.
   *
   * Consumers should account for browser autoplay restrictions and
   * accessibility considerations.
   *
   * @default false
   */
  autoplay?: boolean;

  /**
   * Indicates whether the video should continuously restart after ending.
   *
   * @default false
   */
  loop?: boolean;

  /**
   * Indicates whether audio should initially be muted.
   *
   * Muted playback is commonly required by browsers when autoplay is used.
   *
   * @default false
   */
  muted?: boolean;

  /**
   * Determines how much video data the browser should preload.
   *
   * @default 'metadata'
   */
  preload?: VideoPreload;
}

/**
 * Identifies a supported third-party video provider.
 *
 * Keeping the provider explicit allows the rendering layer to determine
 * how an embed should be constructed without storing provider-generated
 * iframe markup in shared application data.
 *
 * Additional providers may be added as integrations are required.
 */
export type VideoProvider = 'youtube' | 'vimeo';

/**
 * Represents video content hosted by an external video provider.
 *
 * The contract stores the provider and resource identifier rather than
 * provider-specific iframe HTML. A consuming component such as
 * `VideoEmbed` is responsible for constructing the appropriate embed.
 *
 * @example
 * ```ts
 * const video: EmbeddedVideoMedia = {
 *   kind: 'video-embed',
 *   provider: 'youtube',
 *   videoId: 'abc123',
 *   title: 'Window Replacement Process',
 * * };
 * ```
 */
export interface EmbeddedVideoMedia {
  /**
   * Discriminator identifying this media as externally embedded video.
   */
  kind: 'video-embed';

  /**
   * External service hosting the video.
   */
  provider: VideoProvider;

  /**
   * Provider-specific identifier of the video.
   *
   * Store the resource identifier rather than an iframe or generated embed
   * URL whenever possible.
   */
  videoId: string;

  /**
   * Human-readable title describing the embedded video.
   *
   * This can be used for accessible iframe titles and surrounding content.
   */
  title: string;

  /**
   * Optional poster or preview image displayed before the external player
   * is loaded.
   *
   * This can support deferred/lazy embed strategies where the full
   * third-party player is not loaded until requested by the user.
   */
  poster?: ImageMedia;
}

/**
 * Union of non-image media supported by the application.
 *
 * The `kind` property acts as the discriminant and allows consuming
 * components to determine the appropriate rendering strategy.
 */
export type Video = VideoMedia | EmbeddedVideoMedia;
