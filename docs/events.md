# Events calendar and published content

## Implemented locally

`/events` reads `/api/content/events`. Administrators manage records at `/admin/events`; only published events enter the public response. The desktop calendar provides month navigation, Today, category filtering and job-independent event-details dialogs. Narrow layouts present the month's events as an agenda. Dialogs support keyboard dismissal and focus restoration.

When a successful read contains no published records, `app/features/events/demo.ts` supplies explicitly labeled sample events around the serialized initial date. A retrieval failure shows retry feedback rather than substituting samples as live content.

## Data and SEO flow

Calendar presentation uses `CalendarEvent` in `app/features/events/types.ts`: local date/start/end, timezone, category, location and description. The initial demo month uses America/Denver; each event's supplied timezone is stated in its details rather than silently converted to the visitor's zone.

`publishedEventSchemas` converts published local wall-clock times to UTC instants and builds Event JSON-LD only for valid dates/timezones and either an HTTPS virtual URL or a complete postal location. Admin records have optional online/address fields for this purpose. Each event gets a unique schema ID on the calendar route. Samples and drafts do not generate schema; incomplete metadata suppresses schema without hiding the visible event.

## Configuration and remaining work

`site.features.events` gates the route and associated navigation/discovery. Calendar styling uses shared theme tokens. No registration button, capacity claim or registration API is implemented.

- EVENT-01: only after explicit opt-in, implement registrations, transactional capacity/waitlists and cancellation/refund policy.
- SEO-01: complete publication-aware discovery and supported event detail routes if introduced.
- DB-02/ADMIN-01: CMS migrations/backups and audited publishing permissions.
- A11Y-01: real screen-reader/Safari calendar and dialog review.

See [integration-audit.md](integration-audit.md) and [workflows.md](workflows.md).

## Verification

Calendar browser tests cover navigation/filtering/details/mobile layout. Schema tests cover published-only output, missing locations, invalid timezones and UTC conversion. Registration/concurrency tests should be added only when registration is implemented; current calendar tests do not establish capacity behavior.
