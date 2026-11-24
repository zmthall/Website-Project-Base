# Newsletter issues and subscriptions

## Implemented locally

`features.newsletter` controls `/newsletter`, related shared navigation, homepage preview, banner and discovery eligibility. Presentation options and sample issue data are in `feature-layers/newsletter/app/data/newsletter.ts`.

Administrators create Markdown issues at `/admin/newsletters`. The public API `/api/content/newsletters` exposes only published issues whose publication time has arrived. `/newsletter` renders those issues with the shared blog MDC renderer. `useNewsletterContent` supplies the latest published issue to the homepage/banner; sample content is used when no issue data is available. This fallback is presentation, not provider delivery evidence.

The preview carousel has explicit previous/next controls and no automatic advancement. Banner dismissal is in app-session state. The `homepagePreview` and `topBanner` settings control those placements independently.

## Submission flow

`NewsletterSubscribe` posts consented email/list requests to `/api/newsletter/subscriptions`. The server validates the request and stores a private `requested` subscriber record and consent time in the management SQLite database. Duplicate requests are handled locally. Admins review the records at `/admin/subscribers`.

No confirmation email is sent. The external newsletter adapter exposes additional confirm/unsubscribe/preferences operations, but their local endpoints and token lifecycle are not implemented. A stored request is not a verified subscription or a delivered issue.

## Configuration and remaining work

- Public presentation: `feature-layers/newsletter/app/data/newsletter.ts`, `site.features.newsletter`.
- Persistence: `NUXT_MANAGEMENT_DATABASE`.
- Reserved provider values: `NUXT_INTEGRATIONS_NEWSLETTER_*` and transactional mail settings; entering values does not connect them.
- NEWS-01: double opt-in, expiring tokens, preferences ownership, unsubscribe/suppression, signed webhooks and provider synchronization.
- NOTIFY-01: durable deduplicated delivery worker and receipts.
- DB-02/ADMIN-01/PRIVACY-01: migrations/backups, audited administration and retention/disclosures.

See [configuration-and-secrets.md](configuration-and-secrets.md) and [integration-audit.md](integration-audit.md).

## Verification

Use the management browser suite for persisted subscription requests and issue publication, plus newsletter presentation suites. Test actual delivery, confirmation/replay/expiry, unsubscribe and provider failures after the provider is installed; current local tests do not establish those outcomes.
