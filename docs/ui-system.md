# UI foundation

The first theme is **Foundation**, a minimal, responsive business template. Start at `/`, then visit `/showcase`, `/showcase/sections`, and `/showcase/screens`.

## Configure a website

Edit `app/theme/config.ts`. `app.config.ts` exposes this frontend-safe configuration; business identity, contact details, navigation and content remain in `shared/data`. No secrets belong in either configuration.

- `theme`: a key in `app/theme/registry.ts`. Themes define spacing, width, radius, section order and default section variants.
- `palette`: six-digit hex colors for primary, secondary, contrast and complementary. Buttons use primary/secondary, the footer uses contrast, and badges use complementary. Foregrounds are chosen automatically for each color. Neutral light/dark surfaces preserve readable content.
- `mode`: `light`, `dark` or `user`. User mode offers system/light/dark and remembers the visitor’s choice in a cookie.
- `motion`: enables page transitions and optional statistic counters. Reduced-motion preferences still take priority.
- `packs.buttons`: `solid`, `outline` or `minimal`; `shape`: `square`, `soft` or `round`; optional `beveled` treatment.
- `packs.navigation`: `inline`, `centered` or `bordered`. Mobile navigation uses a keyboard-accessible drawer.
- `packs.footer`: `columns`, `minimal` or `centered`.
- `shell`: switches header, footer, preference notice and back-to-top independently.
- `sections`: switches each section on/off. `variant: 'theme'` follows the theme’s default. An explicit variant overrides it. Object keys outside the theme order are appended.

Example overrides inside the configuration:

```ts
mode: 'user',
motion: false,
packs: {
  buttons: { variant: 'outline', shape: 'square', beveled: false },
  navigation: 'centered',
  footer: 'minimal',
},
sections: {
  hero: { enabled: true, variant: 'theme' },
  services: { enabled: true, variant: 'icons' },
  contact: { enabled: true, variant: 'split' },
},
```

The showcase edits request-local Vue state. Changes follow client-side navigation but do not modify files, persist to a database, or affect other visitors. Reloading resets these previews. “Copy configuration” exports serializable JSON for a future admin editor. The color-mode preference cookie is separate from preview state.

## Extend themes and packs

Add a theme descriptor to `app/theme/registry.ts`. Set its layout defaults and semantic dimensions; add aesthetic selectors under `[data-theme='your-theme']` when needed. Select it through `theme` in the config. Keep brand colors separate so a theme works for multiple clients.

For a new button/navigation/footer pack, extend the corresponding union in `app/theme/types.ts`, add its name to the registry list, and implement its CSS or shell rendering branch. Packs share component contracts and semantic tokens. The initial packs deliberately reuse primitives rather than duplicating entire component trees.

Section variants have individual files under `app/components/sections/<family>`. Existing variants delegate shared rendering to `sections/internal/Renderer.vue`. Add a custom component to `app/theme/sections.ts` with a unique family/variant key. It then appears automatically in the section selector. Accept typed `SectionData`, emit `submit` for local form values, and let consumers handle backend work. Individual variants can replace the shared renderer as their design diverges.

`columns` and `mediaFirst` on section data control supported grid/split layouts. A named theme supplies ordering; explicit per-section settings retain client control.

## Fonts

`fonts.sans` and `fonts.serif` each have a family and optional font-file `source`; `fonts.headings` selects the heading role. The base uses system Arial/Georgia, so it has no font network dependency.

For a self-hosted font, place a licensed WOFF2 file under `public/fonts`, then configure `{ family: 'Client Sans', source: '/fonts/client-sans.woff2' }`. `useUIFonts` generates a font face with swap behavior. A Google Font can be self-hosted this way, or use a licensed direct font-file URL. A Google Fonts stylesheet URL is not a font file. An upload/admin interface is future work; configuration already represents its eventual output.

## Components and content

- Base: buttons/links/icons/cards, status and loading primitives, accordion, tabs, carousel, menus, tooltips, popovers, toast, modal and drawer.
- Layout: container, section, stack, cluster and divider.
- Content/article: semantic text, structured rich content, tables, lists, quotations, actions, metadata, author/tags, table of contents, related articles and sharing.
- Business/navigation: shared contact information, locations, hours and timezone-aware status, social links, map opt-in, menus, breadcrumbs and pagination.
- Media: optimized Nuxt images/pictures, art direction, backgrounds, video, click-to-load embeds, galleries/lightbox, before/after and PDF preview/download.
- Blocks/sections: typed business content composed into all registered section variants.
- Shell/system: site header/footer, mobile navigation, preference notice, loading/error/success, offline announcements and error boundaries.

Structured rich text consumes plain text or typed blocks from `app/types/content.ts`. Blog/newsletter Markdown is already integrated through Nuxt MDC and shared prose components; it uses an explicit parsing/rendering boundary rather than arbitrary raw HTML. Public and editor rendering share that boundary. Videos and maps connect to third parties only after the visitor chooses to load them. No analytics or advertising scripts are enabled.

## Forms and feature demonstrations

`app/types/forms.ts` defines serializable form schemas. `FormsDynamicForm` handles supported field types, conditional visibility, validation, linked errors, focused error summaries and submission values. A schema describes UI; server validation remains necessary when adding real submissions. Error/loading/success states are controlled by callers.

Individual controls include text/contact fields, dates/ranges, address, currency, selects and radio groups, switches, ratings, file selection/removal and typed/drawn signatures. Standalone file/signature controls are local previews. The optional estimate attachment control can use the upload adapters only after a private storage/resolver integration is configured. Client file checks remain user feedback, not an upload security boundary. Admin add/edit forms use the shared Forms controls rather than custom raw-control styling.

`/showcase/screens` demonstrates appointment, estimate, event, career, newsletter, authentication/customer, upload, payment-summary and search interfaces. These showcase screens are explicitly frontend examples. Separate real routes implement local auth/CMS and in-memory workflows; no real booking/payment/email/upload provider is connected. Legal text, testimonials and statistics are illustrative.

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

Browser tests use their own server on `127.0.0.1:43188`. They exercise theme changes, all registered section variants, conditional forms, mobile navigation/focus, responsive widths and automated accessibility scans in light/dark modes. The development toolbar is excluded from accessibility checks. Automated checks do not replace assistive-technology and Safari testing on target devices.

## Demo asset sources

The three local demo photographs come from Unsplash:

- `workspace.jpg`: `https://images.unsplash.com/photo-1497366754035-f200968a6e72`
- `office.jpg`: image source `https://images.unsplash.com/photo-1497366811353-6870744d04b2`
- `team.jpg`: image source `https://images.unsplash.com/photo-1521737711867-e3b97375f902`

Replace these local assets and their alt text for each client. `public/example-guide.pdf` is a generated demonstration document. The optional video embed demonstrates Big Buck Bunny and does not load until requested.

## Remaining work

- THEME-01: validated, authorized theme persistence/versioning if runtime editing is required.
- FORMS-01/FORMS-02: validation parity and any future document-bound signature workflow.
- BLOG-01: renderer/prose adversarial tests and production media integration.
- MEDIA-01/PRIVACY-01: reviewed embeds, CSP and accurate consent/privacy behavior.
- A11Y-01: real keyboard/Safari/screen-reader release checks.
- CONTENT-01: replace illustrative content/assets with approved client material.

See [integration-audit.md](integration-audit.md) for criteria and code anchors, [blog.md](blog.md) for live Markdown editing, and [features.md](features.md) for current local versus provider-backed behavior. Provider SDKs and credentials do not belong in this UI core.
