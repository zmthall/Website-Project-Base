# Blog publishing and shared Markdown rendering

## Implemented locally

Public routes are `/blog` and `/blog/:slug`; editing lives at `/admin/blog`. The `blog_posts` table in the private management SQLite file stores Markdown in a `content` column with separate editorial, image, SEO, publication and version fields. Posts are not file-backed `.md` documents.

## Editing and publication flow

1. An authenticated administrator opens the shared resource editor and enters metadata and Markdown.
2. `BlogAdminLiveEditor` debounces parsing through Nuxt MDC, renders a live preview and offers formatting/custom-block insertion.
3. The source and preview can scroll proportionally together or independently; panes stack on narrow screens.
4. Saving goes through admin session/CSRF checks, server field validation and the blog repository. Slugs are unique and versions reject stale edits/deletes.
5. Public reads include only published posts whose canonical publication time has arrived. Future publication dates represent scheduled visibility; no separate publishing worker is required for that read-time filter.

The editor preview and public `BlogMarkdown` component share MDC and `app/components/prose`. Previewing does not save a post. Rendering errors must not overwrite the stored source.

Custom blocks include `post-at-a-glance`, `post-callout`, `post-cta-tile`, `centered-action`, `post-references`, `center-layout-flex` and `phone-number`:

```md
::post-callout{title="Remember"}
Your **formatted** note goes here.
::
```

Ordinary Markdown headings, paragraphs, lists, links, tables, strong text and quotations use the same prose components. Script prose does not execute scripts. The editor uses native shared controls rather than importing the reference application's Toast UI dependency. This implementation synchronizes scroll proportions; it does not claim the reference's heading-position/crop/upload integrations.

## Configuration and boundaries

`site.features.blog` controls availability. `NUXT_MANAGEMENT_DATABASE` selects local storage. Shared form controls, theme tokens and `app/assets/css/prose.css` supply the appearance. Images currently use configured URLs; there is no working blog-image object-storage pipeline.

Public SEO, sharing and table-of-contents behavior derive from the current post. Only real public content belongs in discovery/schema. `/articles` remains a separate demonstration content source.

## What remains

- BLOG-01: revisions/restore, author permissions, image uploads, cache/search invalidation and hostile-content renderer tests.
- DB-02: migrations, backups and production database lifecycle.
- ADMIN-01: durable privileged-operation audit and least-privilege roles.
- UPLOAD-01: private validated image/media upload lifecycle before exposing upload controls.
- SEO-01/CONTENT-01: reviewed content, canonical configuration and publication-aware discovery.

See [integration-audit.md](integration-audit.md). The [GGM review](blog-module-review.md) is a historical reference, not installation instructions or the current storage contract.

## Verification

Management tests cover separate database columns, version conflicts and publication boundaries. Browser tests cover live custom prose, formatting, scroll synchronization, mobile layout and publishing. Keep parser/prose adversarial tests and actual browser checks in the production acceptance work.
