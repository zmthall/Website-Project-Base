# Local workflow foundations

Appointments, estimates and payments now have typed contracts, API adapters, process-local repositories and executable state transitions. This is a **simulation**, not a production booking system, binding quote service or payment processor. The user-facing pages label that distinction. Existing auth/CMS storage is unchanged; workflow records do not use a database.

## Configuration and access

- `shared/data/workflows.ts`: timezone, lead time, horizon, weekdays, closures, duration, office/remote locations, providers, quote decisions/deposits and demo payment catalog.
- `shared/data/appointments.ts`: service and meeting labels. Service IDs must also have a duration in workflow configuration.
- `shared/data/estimates.ts`: project, budget and timing options.
- `site.features.appointments`, `estimates`, `payments`, `uploads`: server-enforced endpoint gates. Payments and uploads remain off by default. Enable payments explicitly to see the card-free simulator under `/customer/workflows`.
- Creating and managing requests requires the existing local customer login. Resources belong to the server-authenticated account ID, never an email or owner ID supplied by the browser. Customer mutations require their session's `X-CSRF-Token`. The existing admin role and separate CSRF token are required for quotes.
- Clients keep a stable `Idempotency-Key` for an unchanged request. Reusing a key with different input is a conflict. Mutations use versions to reject stale updates. Inputs use integer minor currency units; the client cannot choose checkout totals.

## Endpoints

All paths below start with `/api/workflows`. JSON responses have `Cache-Control: no-store`. Error responses use HTTP 400 validation, 401 authentication, 403 CSRF, 404 absent/foreign/disabled records, 409 conflict, and 503 unavailable integration/capacity.

| Method     | Path                                                                               | Purpose                                                                                    |
| ---------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| GET        | `/capabilities`                                                                    | Explicit demo mode and configured integration capabilities                                 |
| GET        | `/appointments/availability?date=YYYY-MM-DD&service=...&location=...&provider=...` | Available business-zone slots, UTC start/end and display zone                              |
| GET / POST | `/appointments`                                                                    | Customer list / reserve a demo appointment                                                 |
| GET        | `/appointments/:id`                                                                | Owned appointment                                                                          |
| POST       | `/appointments/:id/reschedule`                                                     | `{ version, date, time }`, conflict checked before releasing old time                      |
| POST       | `/appointments/:id/cancel`                                                         | `{ version }`, release time and cancel queued reminders                                    |
| GET / POST | `/estimates`                                                                       | Customer list / request an estimate                                                        |
| GET        | `/estimates/:id`                                                                   | Owned detail with line items, total, expiry, attachments and status                        |
| POST       | `/estimates/:id/decision`                                                          | `{ version, decision: accepted or declined }`                                              |
| GET        | `/estimates/admin`                                                                 | Admin request inbox                                                                        |
| PUT        | `/estimates/admin/:id`                                                             | `{ version, items, expiresAt, depositAmount }`, send a demo quote                          |
| GET / POST | `/payments`                                                                        | Customer payment history / configured catalog or accepted-estimate deposit session         |
| GET        | `/payments/:id`                                                                    | Verify with server provider, then return authoritative status                              |
| POST       | `/payments/:id/verify`                                                             | Explicit status refresh                                                                    |
| POST       | `/payments/:id/simulate`                                                           | Demo only: pending/succeeded/declined/canceled/failed outcomes, CSRF and ownership checked |

See `shared/types/workflows.ts` for complete request/response, repository, notification, upload and provider contracts. API adapter exports live in each feature's `index.ts`; `useWorkflows` supplies the local cookie/CSRF transport. External token transports can be injected separately.

## Scheduling

Availability uses an IANA business timezone and UTC instants. It checks valid dates, working days, closures, lead time, horizon, provider/location relationships and service duration. Nonexistent DST wall-clock times are rejected. Ambiguous fall-back times resolve deterministically to a single instant; this daytime sample schedule does not offer overnight shifts. Overlapping appointments conflict across services and locations for the same provider. A provider has capacity one.

Synchronous check-and-write operations are atomic **within one process**. Rescheduling checks the destination before changing the old booking. Version checks prevent stale cancellation or rescheduling. Customer account pages expose records and available replacement times, and report unavailable/expired actions without destroying current bookings.

## Estimates and deposits

Status contract: `requested`, `draft`, `sent`, `accepted`, `declined`, `expired`, `canceled`. The implemented path is requested → sent → accepted/declined/expired. Draft/canceled are reserved for later authoring/withdrawal flows; no public client can assign arbitrary status. Admins prepare line-item quotes at `/admin/estimates` (the simple editor offers one line; the API accepts up to 50). Totals and deposits are recalculated and bounded on the server. Sent quotes expire before a decision; accepted quotes remain accepted. An expired quote needs a new request in this prototype.

Optional uploads use `UploadResolver`, existing upload adapters/transfer controls and `FormsEstimateAttachments`. A startup integration calls `workflowService.configureUploads(resolver)` and implements `/api/uploads` initialization/content/complete operations. The resolver must check current ownership, ready/scanned status, expiry and permitted file policy. Until then capability `uploads` is false, the picker is hidden, and supplied attachment IDs fail closed. No fake file receipt or stored-byte claim is made. A customer cannot attach someone else's upload merely by knowing its ID.

Payments accept only a configured one-time product ID or an owned, accepted estimate with a positive deposit. Concurrent/retried deposit creation reuses a pending session and rejects already-paid deposits. Status polling verifies server-owned provider state. Receipts are created once after verified success, never from a redirect/query argument. Declines/failures/cancellations have no paid receipt; pending sessions expire. Retrying a terminal failed deposit uses a new idempotency key. Invoice references are not implemented because there is no invoice model; add an owner-checked authoritative invoice resolver before exposing them.

The default `DemoPaymentProvider` is deliberately card-free and synchronous. The separate async `HostedPaymentGateway` defines create/retrieve/signed-webhook boundaries for a later real integration. It is not wired to checkout. Never submit PAN/CVV/card data to these endpoints. No provider secret or SDK exists in client code. Production reconciliation must check currency, amount, provider session, ownership and deduplicated signed event IDs in a durable transaction.

## Notifications

`NotificationJob` is a server-owned outbox record. Confirmations, reschedules, cancellations, reminders, quote activity and receipts queue jobs; canceled/rescheduled appointments cancel obsolete reminders. `NotificationDispatcher` is the future email/SMS integration seam. No worker runs and nothing is delivered. Do not treat a queued job as sent. Durable retries, delivery deduplication, preferences, reminder timing and provider credentials belong in the next integration phase.

## Events

`/events` already reads published CMS records. The calendar retains clearly labeled sample events only when a successful response has no published records. A retrieval error displays retry feedback instead of presenting samples as live data. Published records generate unique Event JSON-LD IDs only when dates/timezone and an HTTPS virtual URL or complete postal location are available. New optional address/URL fields are in the admin event editor. Samples/drafts never produce event schema. Registration/capacity is explicitly deferred and has no fake controls or endpoint.

## Production replacement checklist

Replace `server/repositories/workflows.ts` with durable repositories and transactions. Add unique slot/resource constraints, persistent idempotency, cross-process concurrency, retention/quotas, audited authoring, background expiry/reconciliation and delivery workers. Install real private upload storage and a hosted payment gateway; keep credentials only in server runtime config. Gate or remove all `/simulate` endpoints in production. Add deployment-specific limits and provider integration tests before collecting real information or money.

The in-memory fixture is intentionally bounded to 10,000 idempotent operations per process; restarts discard bookings, quotes, attempts, receipts and outbox jobs. It cannot prove multi-instance concurrency or recovery across restarts.

## Verification

Domain tests cover timezone/DST rules, concurrent/overlapping claims, stale versions, cancellation/reminder cleanup, quote totals/expiry/ownership, upload resolver boundaries, retries, verified payment success, decline, cancellation, failure and timeout. Browser tests cover customer scheduling, CSRF, private access, estimate requests, responsive layout and automated accessibility. Real Safari/screen-reader testing, hosted checkout, signed webhooks, persistent restart recovery and real delivery remain integration acceptance checks.
