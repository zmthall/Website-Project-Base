# Reviews and moderation

## Implemented locally

`features.reviews` gates the public review page, related shared navigation and homepage preview. Curated testimonial sections remain a separate public-content source.

`/reviews` reads published records from `/api/content/reviews`. The page computes its displayed summary from the loaded reviews and supports rating filters and newest/highest/lowest sorting. When no published records are available it uses labeled illustrative records from `shared/data/reviews.ts`. Filtering does not change the full loaded-set summary. Samples are not verified-customer evidence or aggregate-rating structured data.

`homepagePreview` and `showSubmissionDemo` remain the presentation settings. Despite the historical setting name, the enabled submission form now sends a real local request.

## Submission and publication flow

1. A visitor submits name, rating and review text to `POST /api/reviews`.
2. The server validates and saves a SQLite record with status `pending`, ignoring a requested public status.
3. An administrator reviews it at `/admin/reviews` and may publish or reject it.
4. Only published records enter the public list; internal notes stay private.

Submitting does not immediately add a review to the published list. No external review service, purchase verification or delivery provider is connected.

## Configuration and remaining work

- Presentation/sample fallback: `shared/data/reviews.ts`.
- Local storage: `NUXT_MANAGEMENT_DATABASE`.
- REV-01: provenance, duplicate/abuse controls, audited moderation, external imports and authoritative aggregates as pagination grows.
- ADMIN-01/DB-02: roles/audit, migrations and backup/restore.
- PRIVACY-01/CONTENT-01: approved review-display and retention rules; replace illustrative content for launch.

Details: [integration-audit.md](integration-audit.md).

## Verification

Management tests cover pending submissions and publication boundaries. Presentation tests cover filters and responsive controls. Production acceptance additionally needs spam/duplicate, moderation permissions, pagination/aggregate consistency and any external-provider failure cases.
