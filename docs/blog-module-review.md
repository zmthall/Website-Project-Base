# GGM-Nuxt blog module review

Reviewed the current `main` source at commit `fac45ee93d75a529a4f2249a405bf45562b75d53`. This is a source review; the external backend was not accessed and the original app was not run. This historical review predates the template implementation. The current template now has SQLite Markdown publishing, shared Nuxt MDC prose and a live editor; use [blog.md](blog.md) for its current behavior. Descriptions below refer to the pinned reference source unless explicitly marked as a template update.

## Main finding: two storage approaches coexist

The active public and admin pages call `useBlogPostsApi()`. It talks directly to an external API at a hardcoded production origin or a local port 4000 origin, selected by `runtimeConfig.public.useLocalApi`. Admin calls attach Firebase ID tokens. The external blog database, upload implementation, uniqueness enforcement, and publication scheduling backend are not included in this repository.

The repository also retains an older file-backed implementation under `server/api/admin/blog/*` and `server/api/blog/*`. It reads/writes `content/blog/post/*.md` or `.mdx`, uses gray-matter frontmatter, and writes uploaded images to both `public/images/blog` and `.output/public/images/blog`. The current pages do not call those local blog endpoints. The tracked source has no content directory or content.config.ts, and its package/config does not enable @nuxt/content, although the legacy public list endpoint still calls queryCollection(). This older path is incomplete as a standalone current implementation.

The two contracts differ: the current API uses a boolean `published` plus `publishTimestamp`, while old frontmatter uses `published` as a date string. These should be mapped explicitly rather than combined.

## Public experience

- Blog index: latest-post feature, staff-pick links, cards, images, tags, publication dates, read time, summaries, and an eight-post page size with load-more. Pagination state survives navigation through useState().
- Post detail: author/date/read-time metadata, summary, thumbnail, Markdown/MDC body, nested table of contents, responsive sidebar, tags, social sharing, and related posts. Drafts and future/invalid publication dates are rejected by the page. The backend must enforce the same visibility rules.
- The intermediate `/news/blog/post` route redirects to `/news/blog`.
- Home page integration fetches the latest post. Navigation and admin links include blog destinations; i18n resources contain blog labels.
- PostImage provides dimensions, eager/lazy loading, and a fallback thumbnail.

## Admin experience

- Dashboard: ten-post pages ordered by update time; create/edit modal, private preview, delete confirmation, draft/live/scheduled status badges, and publish-now or date-based publishing.
- The API composable also exposes unpublish, even though the dashboard does not call it.
- AddBlogPostModal handles title, slug, author, summary, tags, featured/staff-pick flags, draft/publication data, thumbnail, separate SEO image, SEO title/description, and canonical URL. It checks uniqueness, uploads selected images, creates/updates the post, and emits results to update the list.
- MarkdownEditor dynamically loads Toast UI on mount. It uses Markdown mode with a formatting toolbar and hides the WYSIWYG mode switch.
- ContentMdcPreview renders the same MDC content used by the public reader. The side-by-side editor and preview have optional bidirectional scroll synchronization based on heading positions, with proportional fallback and resize handling.
- ImageUpload offers drag/drop, file type/size checks, cropping, and alt text. InlineTagsEditor offers tag editing/suggestions. Upload enforcement still belongs on the server.
- The admin post route is a private reader/preview, not a separate edit page.
- Access rules differ in the source: the dashboard permits roles admin/user, the private post route requires admin, and the Nuxt admin API middleware asks an external service to verify admin status. Our template should use its existing admin session/CSRF middleware consistently.

## Supporting helpers

- Models: full post, card, admin preview, SEO, update, tiny staff-pick, slug-only, upload response, pagination, and list/filter options.
- Mappers: snake_case API records to camelCase frontend records.
- Reading helper: Markdown cleanup and estimated minutes at 250 words/minute. The editor modal duplicates this logic and uses a slightly different cleanup routine.
- Tags helper: business-specific medical/general tag lists, searching, suggestions, and category inference.
- Schema helper: Article or MedicalWebPage JSON-LD depending on tags. No call site for useBlogSchema/generateBlogSchema was found. The public detail page uses title and seoDescription but a hardcoded social image rather than the stored seoImage.
- Table-of-contents helper parses H2–H4 Markdown headings; the editor scroll helper separately parses headings and explicit IDs. Heading parsing, duplicate-ID handling, and renderer IDs should be aligned during migration.
- Prose components style headings, paragraphs, lists, tables, links, blockquotes, callouts, at-a-glance sections, references, CTA tiles, centered layouts/actions, and phone links.
- `blog/post/container.vue`, `main-image.vue`, and `section.vue` are empty placeholders. ProseScript is also an empty placeholder. ProseOl currently renders a ul with decimal styling rather than an ol.

## Content calendar is a separate editorial tool

The dashboard opens a calendar modal. The tool imports CSV editorial plans (date/type/service/city/title/keyword/question/notes), shows a month grid with service colors, supports copyable post requests, ICS export, printing, URL/sessionStorage sharing, and list/load/save/delete of saved calendars. Its `/api/calendar` requests are not backed by handlers in this repository. Planning dates in this tool are distinct from publication dates in the actual blog posts.

Rebuild controls also exist: they trigger build/status/clear/runtime endpoints and poll for a restart. These are deployment-specific controls, not a requirement for the current external API blog data path.

## Original migration plan (historical)

1. Keep the useful public reader and admin workflows, adapted to this template's components, theme, SEO, and shared article types.
2. Implement one local persistent post store to start, following the local-first direction used for auth. Use draft/published/scheduled state with one canonical publication timestamp.
3. Put public and admin adapters behind same-origin Nuxt endpoints; use existing admin authorization and CSRF checks for every write/upload/preview endpoint.
4. Reuse the editor/MDC preview pattern if rich component content is wanted. Treat Toast UI, MDC, and cropping as explicit dependency choices; the plan originally evaluated these separately. MDC is now installed; Toast UI/cropping are not part of the current template.
5. Enforce validation, unique slugs, public visibility, safe content rendering, and image limits on the backend. Legacy file handlers accept Markdown/HTML and uploads with incomplete validation; do not copy them unchanged.
6. Replace company-specific tag lists, hardcoded API origins, Firebase token plumbing, roles, and layout styling with this template's configuration and auth.
7. Add sitemap/structured data using existing SEO helpers and only expose actually published posts. The current /articles pages are demo-backed; decide whether the new blog replaces them or lives alongside them before wiring navigation.
8. Treat the editorial calendar as a later optional feature; it needs its own storage/API and generic categories.

## Source inventory

Links are pinned to the reviewed commit so this inventory stays reviewable if main changes.

### Public pages and layouts

- [app/pages/news/blog/index.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/pages/news/blog/index.vue)
- [app/pages/news/blog/post/[slug].vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/pages/news/blog/post/%5Bslug%5D.vue)
- [app/pages/news/blog/post/index.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/pages/news/blog/post/index.vue)
- [app/layouts/blog-post.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/layouts/blog-post.vue)

### Admin pages and editor

- [app/pages/admin/blog/index.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/pages/admin/blog/index.vue)
- [app/pages/admin/blog/post/[slug].vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/pages/admin/blog/post/%5Bslug%5D.vue)
- [app/layouts/admin-blog-post.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/layouts/admin-blog-post.vue)
- [app/components/Admin/AddBlogPostModal.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/Admin/AddBlogPostModal.vue)
- [app/components/blog/admin/MarkdownEditor.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/admin/MarkdownEditor.vue)
- [app/components/base/admin/ContentMdcPreview.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/base/admin/ContentMdcPreview.vue)
- [app/components/Admin/ContentCalendarTool.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/Admin/ContentCalendarTool.vue)
- [app/components/Admin/ContentCalendarToolModal.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/Admin/ContentCalendarToolModal.vue)

### Composables, models, and helpers

- [app/composables/blog/adminMarkdownPreviewScrollSync.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/blog/adminMarkdownPreviewScrollSync.ts)
- [app/composables/blog/blogPostsAPI.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/blog/blogPostsAPI.ts)
- [app/composables/blog/reading.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/blog/reading.ts)
- [app/composables/blog/schema.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/blog/schema.ts)
- [app/composables/blog/tags.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/blog/tags.ts)
- [app/models/blog.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/models/blog.ts)
- [app/utils/blogPostHelpers.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/utils/blogPostHelpers.ts)
- [app/utils/blogPostMappers.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/utils/blogPostMappers.ts)
- [app/utils/buildTocFromMdc.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/utils/buildTocFromMdc.ts)
- [app/composables/socialShare.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/socialShare.ts)
- [app/composables/dates/dateFormat.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/dates/dateFormat.ts)
- [app/composables/text.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/text.ts)

### Blog presentation components

- [app/components/blog/PostImage.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/PostImage.vue)
- [app/components/blog/post/ContentRenderer.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/ContentRenderer.vue)
- [app/components/blog/post/TableOfContents.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/TableOfContents.vue)
- [app/components/blog/post/TableOfContentsList.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/TableOfContentsList.vue)
- [app/components/blog/post/container.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/container.vue)
- [app/components/blog/post/header.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/header.vue)
- [app/components/blog/post/main-image.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/main-image.vue)
- [app/components/blog/post/section.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/section.vue)
- [app/components/blog/post/social-share.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/social-share.vue)
- [app/components/blog/post/tags.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/blog/post/tags.vue)

### Rich content and form dependencies

- [app/components/prose/CenterLayoutFlex.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/CenterLayoutFlex.vue)
- [app/components/prose/CenteredAction.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/CenteredAction.vue)
- [app/components/prose/PhoneNumber.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/PhoneNumber.vue)
- [app/components/prose/PostAtAGlance.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/PostAtAGlance.vue)
- [app/components/prose/PostCallout.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/PostCallout.vue)
- [app/components/prose/PostCtaTile.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/PostCtaTile.vue)
- [app/components/prose/PostReferences.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/PostReferences.vue)
- [app/components/prose/ProseA.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseA.vue)
- [app/components/prose/ProseBlockquote.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseBlockquote.vue)
- [app/components/prose/ProseH1.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseH1.vue)
- [app/components/prose/ProseH2.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseH2.vue)
- [app/components/prose/ProseH3.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseH3.vue)
- [app/components/prose/ProseH4.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseH4.vue)
- [app/components/prose/ProseLi.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseLi.vue)
- [app/components/prose/ProseOl.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseOl.vue)
- [app/components/prose/ProseP.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseP.vue)
- [app/components/prose/ProseScript.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseScript.vue)
- [app/components/prose/ProseStrong.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseStrong.vue)
- [app/components/prose/ProseTable.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseTable.vue)
- [app/components/prose/ProseUl.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/prose/ProseUl.vue)
- [app/components/base/form/ImageUpload.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/base/form/ImageUpload.vue)
- [app/components/base/form/InlineTagsEditor.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/base/form/InlineTagsEditor.vue)
- [app/models/ImagesData.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/models/ImagesData.ts)

### Server endpoints and auth dependencies

- [server/api/admin/blog/[slug].delete.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/%5Bslug%5D.delete.ts)
- [server/api/admin/blog/[slug].get.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/%5Bslug%5D.get.ts)
- [server/api/admin/blog/[slug].post.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/%5Bslug%5D.post.ts)
- [server/api/admin/blog/[slug].put.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/%5Bslug%5D.put.ts)
- [server/api/admin/blog/exists/[slug].get.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/exists/%5Bslug%5D.get.ts)
- [server/api/admin/blog/image.post.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/image.post.ts)
- [server/api/admin/blog/posts.get.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/posts.get.ts)
- [server/api/admin/blog/posts.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/posts.ts)
- [server/api/admin/blog/render.post.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/blog/render.post.ts)
- [server/api/blog/[slug].get.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/blog/%5Bslug%5D.get.ts)
- [server/api/blog/posts.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/blog/posts.ts)
- [server/api/sitemap-blog.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/sitemap-blog.ts)
- [server/middleware/auth.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/middleware/auth.ts)
- [app/stores/authStore.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/stores/authStore.ts)
- [app/composables/firebaseAuth.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/firebaseAuth.ts)
- [app/composables/authRefresh.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/composables/authRefresh.ts)
- [app/plugins/auth.lazy.client.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/plugins/auth.lazy.client.ts)
- [app/data/adminLinks.json](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/data/adminLinks.json)
- [app/data/navLinks.json](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/data/navLinks.json)
- [nuxt.config.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/nuxt.config.ts)
- [package.json](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/package.json)

### Related deployment controls

- [app/components/Admin/RebuildButton.vue](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/app/components/Admin/RebuildButton.vue)
- [server/api/admin/rebuild.post.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/rebuild.post.ts)
- [server/api/admin/rebuild-status.get.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/rebuild-status.get.ts)
- [server/api/admin/clear-rebuild.post.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/clear-rebuild.post.ts)
- [server/api/admin/runtime.get.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/server/api/admin/runtime.get.ts)
- [types/rebuild.ts](https://github.com/zmthall/GGM-Nuxt/blob/fac45ee93d75a529a4f2249a405bf45562b75d53/types/rebuild.ts)

### Implementation update: database and MDC

The template now follows the current API record model rather than the legacy file
routes: Markdown `content`, editorial metadata, publication state, and SEO metadata
are separate SQLite columns. The current GGM model and mapper files explicitly
separate these fields; its public ContentRenderer and admin ContentMdcPreview both
render the content string with Nuxt MDC. The template uses that same parser and
renderer for public posts, newsletters, and admin previews. The external database
schema/API server itself is not included in GGM-Nuxt, so its exact database engine
cannot be established from this repository alone. Thumbnail upload and Toast UI have not been ported. The current native editor has debounced live preview, a formatting/prose toolbar and optional proportional bidirectional scroll synchronization. Images currently use URLs. See [blog.md](blog.md) and TODO BLOG-01/UPLOAD-01.
