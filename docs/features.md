# Feature implementation and extension

## Implemented locally

| Area                    | Routes / endpoints                                                               | Storage and current behavior                                                  | Open TODO IDs            |
| ----------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Admin/customer identity | `/admin/login`, `/customer/login`, `/api/admin/auth/*`, `/api/customer/auth/*`   | Separate opaque cookie sessions; registered customer accounts in SQLite       | AUTH-01–03               |
| Blog/content management | `/admin/blog`, `/blog`, `/api/blog/*`, `/api/admin/manage/*`                     | PostgreSQL records and separate metadata; public visibility enforced server-side | DB-02, BLOG-01, ADMIN-01 |
| Contact                 | `/contact`, `POST /api/contact`, `/admin/messages`                               | Private SQLite inquiries; no email delivery                                   | CONTACT-01               |
| Newsletter              | `/newsletter`, `/api/content/newsletters`, `POST /api/newsletter/subscriptions`  | Published issues and private requested subscriptions in SQLite                | NEWS-01                  |
| Reviews                 | `/reviews`, `POST /api/reviews`, `/admin/reviews`                                | New submissions are pending; only published reviews appear publicly           | REV-01                   |
| Careers                 | `/careers`, `/careers/apply`, `/admin/jobs`, `/admin/applications`               | Published openings and private applications in SQLite                         | CAREER-01                |
| Events                  | `/events`, `/api/content/events`, `/admin/events`                                | Published CMS calendar; eligible records generate JSON-LD                     | EVENT-01, SEO-01         |
| Appointments            | `/appointments`, `/customer/workflows`, `/api/workflows/appointments/*`          | Process-local availability/booking/rescheduling/cancellation simulation       | DB-01, BOOK-01–02        |
| Estimates               | `/estimates`, `/admin/estimates`, `/customer/workflows`                          | Process-local requests, quotes, decisions and expiry                          | DB-01, EST-01–02         |
| Payments                | `/customer/workflows`, `/api/workflows/payments/*`                               | Card-free, server-verified simulation; disabled by default                    | PAY-01–04                |
| Uploads                 | Local private storage, inspection, owner-only endpoints and estimate attachments | Production malware scanner/object store and durable workflow retention        | UPLOAD-01, EST-02        |
| Notifications           | Workflow outbox contracts                                                        | Queued in memory only; no worker or delivery provider                         | NOTIFY-01                |
| Search                  | `/search`, `/api/search`, scoped public pages/content/events                     | Request-time local index; no hosted provider configured                       | SEARCH-01                |

Read [the audit](integration-audit.md) for full ID descriptions. Existing SQLite persistence does not make a feature production-ready; memory workflows do not survive restarts.

## How features are wired

`shared/data/site.ts` declares availability. `useFeature` and shared navigation filter enabled UI; route middleware checks public feature paths. Server handlers independently check features and authorization. Flags do not grant permissions or install an adapter.

`feature-layers/registry.ts` is the build-time feature catalog. Each manifest records dependencies, guarded routes, owned implementation paths and shared integration seams. Nuxt extends every registered layer, and all implemented features now own their runtime code. See [Feature layers](feature-layers.md).

A layer's `index.ts` exports its public contracts and operations. Shared feature transport, request state and form support live in `feature-layers/_shared`; `createFeatureApis` in `feature-layers/api.ts` constructs gated adapters from an injected `ApiClient`, and the `$features` plugin exposes them within Nuxt. Contracts returned by an external adapter are not proof that the same endpoint is implemented locally.

Local admin/customer auth adapters deliberately use same-origin credentials and CSRF. `useAdminManagement` supplies the local admin transport. `useWorkflows` supplies the local customer workflow transport. The generic `$api` is anonymous by default and does not forward SSR cookies. See [application-api.md](application-api.md).

## Request state

`useFeatureRequest` supports loading, success, error and cancellation, discards stale results and aborts on disposal. The shared feature form accepts an async operation; schema-only showcase forms remain examples. Live pages use their local endpoints and must describe actual outcomes: stored inquiry, queued job, confirmed simulation, or verified demo payment—not delivered email or a real charge.

Idempotency keys must remain stable after an uncertain response. `useWorkflowKey` retains a key for an unchanged payload and works on local HTTP origins. The server workflow service enforces matching fingerprints and versions. Other integration endpoints still need their own durable idempotency under API-01/API-02.

## Extending a module

1. Define request/response/status contracts, ownership and failure behavior.
2. Implement runtime validation and server authorization independently of UI checks.
3. Select a repository/adapter and validate its private runtime settings before activation.
4. Keep provider credentials and SDKs in server code. Expose only explicitly approved public identifiers.
5. Connect shared form controls and accessible loading/error/confirmation states.
6. Test authorization, retries, expiry, concurrency and provider failure paths; update the guide and audit together.

Configuration: [configuration-and-secrets.md](configuration-and-secrets.md). Detailed workflow contracts: [workflows.md](workflows.md).
