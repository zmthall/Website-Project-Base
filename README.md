# Website Template

**A configurable Nuxt foundation for building custom business websites.**

Start with a working site, a shared design system, reusable content sections, local administration, and optional customer features. Customize the business and brand through typed configuration, then replace local storage and simulated services with production integrations as the project grows.

This repository is a starting point for a larger application. It includes functioning local features and tested workflow foundations; it is not a fully connected production platform.

[Quick start](#quick-start) · [Feature status](#feature-status) · [Configuration](#configuration) · [Project structure](#project-structure) · [Documentation](#documentation)

---

## The concept

The template separates four responsibilities:

1. **Business content** — identity, contact details, services, navigation, and other public information.
2. **Presentation** — themes, colors, typography, component packs, and page-section variants.
3. **Feature behavior** — forms, domain contracts, request state, customer workflows, and administration.
4. **Server integrations** — authentication, repositories, provider adapters, credentials, and authorization.

That separation lets you reuse the foundation across clients without putting business-specific logic into generic controls or provider credentials into frontend configuration.

### Included

- Nuxt 4, Vue 3, TypeScript, and server-side rendering.
- Configurable themes, light/dark modes, brand palettes, fonts, and section variants.
- Shared form controls and accessible interaction primitives built with Reka UI.
- Local admin authentication and separate customer registration/sign-in.
- SQLite-backed content management, private submissions, and career applications.
- Database-stored Markdown blogs with custom prose components and live previews.
- A careers landing page, job details, and a separate application flow.
- In-memory appointment, estimate, and payment simulations.
- SEO metadata, structured data, sitemap, and robots helpers.
- Unit tests, Playwright browser tests, automated accessibility checks, and CI configuration.

## Quick start

### Requirements

| Tool                        | Version                                      |
| --------------------------- | -------------------------------------------- |
| Node.js                     | 24.x, at least 24.11; see [.nvmrc](.nvmrc)   |
| npm                         | 12.x; the repository pins 12.0.2             |
| Hosting for server features | A Node runtime with private writable storage |

Node 24 is required for the local SQLite implementation.

### Install and run

From your checkout:

```sh
nvm install
nvm use
npm install --global npm@12.0.2
npm ci
cp .env.example .env
npm run dev
```

Open the address Nuxt prints, normally `http://localhost:3000`.

The public site can run before you configure an administrator. To use the admin area, fill in the administrator variables described below and restart the dev server.

> The development command listens on all network interfaces. To view the site from another device or a host machine outside a VM, open `http://<server-ip>:3000`. The devices must have a working network route and the server firewall must allow the port. Use this exposure only on a trusted development network.

### Explore the template

| Route                | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `/`                  | Business website foundation                          |
| `/showcase`          | Shared components, form controls, and theme examples |
| `/showcase/sections` | Section variants and visibility examples             |
| `/showcase/screens`  | Illustrative feature screens                         |
| `/admin/login`       | Administrator sign-in                                |
| `/customer/login`    | Customer sign-in and registration                    |

Optional feature routes return 404 when their feature is disabled. Showcase examples are separate from connected business workflows.

## Feature status

**Local persistence and production integration are different things.** Some modules save records to SQLite; others deliberately simulate a workflow in server memory.

| Area                          | Available now                                                                                                  | Still needed for production                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Public website                | Configurable pages, sections, navigation, responsive media, forms, and SEO                                     | Approved client content/assets, policies, and deployment review                           |
| Administrator access          | Environment-provisioned account, guarded admin pages/APIs, CSRF checks, session expiry                         | Shared session/rate-limit storage, managed provisioning, MFA, and audit trails            |
| Customer accounts             | Registration, sign-in/out, salted scrypt password hashes, SQLite accounts                                      | Email verification/recovery, expanded account management, optional identity providers     |
| Blog and newsletter issues    | SQLite content, publishing controls, SEO fields, shared Markdown renderer, live editor                         | Editorial revisions, production media storage, delivery integrations                      |
| Contact, reviews, subscribers | Private inquiries, review moderation, subscription requests with consent                                       | Provider delivery/synchronization, stronger abuse controls, retention policies            |
| Careers                       | Published openings, details modal, application notice/form, private admin review                               | Applicant retention, notifications, optional private document uploads                     |
| Events                        | Published CMS events, calendar, complete-record structured data, labeled sample fallback                       | Registration/capacity only if explicitly added later                                      |
| Appointments                  | Availability rules, timezone handling, provider/location selection, conflict checks, rescheduling/cancellation | Durable transactions, cross-instance coordination, actual scheduling/delivery integration |
| Estimates                     | Private requests, admin quotes, server totals, expiry, customer decisions, deposit references                  | Durable storage, expanded quote authoring, real uploads/payments                          |
| Payments                      | Card-free demo provider, server-owned amounts, verified demo status, receipts, retry protection                | Hosted processor, signed webhooks, durable reconciliation; disabled by default            |
| Uploads and notifications     | Upload contracts/resolver seam, transfer controls, notification outbox contracts                               | Private object storage/scanning and delivery workers                                      |

**Demo bookings, quotes, and payments do not make real appointments, binding offers, or charges. No email/SMS delivery is configured.** Workflow records and queued notifications reset when the server restarts.

See [workflow foundations](docs/workflows.md), [remaining work](docs/remaining-work.md), and the [integration audit](docs/integration-audit.md) for the precise boundaries.

## Configuration

### Public content and branding

| File                                                       | What to change                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| [shared/data/site.ts](shared/data/site.ts)                 | Site name, canonical origin, locale, SEO defaults, and feature flags |
| [shared/data/business.ts](shared/data/business.ts)         | Business identity, contact information, locations, and hours         |
| [shared/data/navigation.ts](shared/data/navigation.ts)     | Menus, footer groups, and actions                                    |
| [app/theme/config.ts](app/theme/config.ts)                 | Theme, palette, fonts, modes, motion, packs, and section choices     |
| [app/theme/sections.ts](app/theme/sections.ts)             | Section component registry and variants                              |
| [shared/data/careers.ts](shared/data/careers.ts)           | Careers landing-page content                                         |
| [shared/data/appointments.ts](shared/data/appointments.ts) | Appointment labels and meeting choices                               |
| [shared/data/estimates.ts](shared/data/estimates.ts)       | Project, budget, and timeline choices                                |
| [shared/data/workflows.ts](shared/data/workflows.ts)       | Demo scheduling rules, quote options, and payment catalog            |
| [app/data/demo.ts](app/data/demo.ts)                       | Example content used by the generic demonstration                    |

`app.config.ts` exposes the serializable UI defaults. Everything in public site/theme configuration must be safe for visitors to read. Dynamic backend records belong in repositories, not static content files.

### Feature switches

Edit `site.features` in `shared/data/site.ts`. Boolean capabilities must be explicitly enabled. Authentication providers use `false`, `local`, `firebase`, or `supabase`; only local authentication is implemented today.

Feature switches control route, navigation, and API availability. They do not install providers or replace authorization. For example, enabling payments exposes the local simulator; it does not connect Square or Stripe.

### Environment variables and credentials

Copy [.env.example](.env.example) into your ignored `.env`. It contains the existing local settings and blank placeholders for future database, Square/Stripe, email, storage, identity, search, and secret-management integrations.

| Variable/group             | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `NUXT_PUBLIC_API_BASE`     | Browser-visible API path/origin; defaults to `/api`   |
| `NUXT_API_BASE`            | Optional trusted server-side API base override        |
| `NUXT_ADMIN_*`             | Local administrator credentials and display name      |
| `NUXT_CUSTOMER_*`          | Optional customer preset and customer database path   |
| `NUXT_MANAGEMENT_DATABASE` | Local content/submission SQLite file                  |
| `NUXT_INDEXING_ENABLED`    | Production indexing opt-in; false by default          |
| `NUXT_INTEGRATIONS_*`      | Reserved private runtime settings for future adapters |

Private integration defaults live in [server/config/integrations.ts](server/config/integrations.ts) and are declared under `runtimeConfig.integrations` in `nuxt.config.ts`.

- Never commit `.env`, provider credentials, database files, or private keys.
- Never put secrets in `NUXT_PUBLIC_*`, `shared/data`, public UI configuration, or browser responses.
- Adding a credential does **not** activate an unimplemented integration.
- A built server does **not** automatically read `.env`; inject production values through the host's environment or secret manager.
- Passwords are one-way hashed. Retrievable API credentials need secret management or encryption, not an “unhashing” mechanism.

See [configuration and secrets](docs/configuration-and-secrets.md) for the full inventory, processor-specific requirements, rotation, and future encrypted-database storage design.

## Using the local features

### Administrator access

Keep `features.auth: 'local'`, set these values in `.env`, and restart the server:

```dotenv
NUXT_ADMIN_EMAIL=
NUXT_ADMIN_PASSWORD=
NUXT_ADMIN_NAME=Administrator
```

Fill the first two entries with your own email and a strong unique password. No default password is supplied. Sign in at `/admin/login`.

All admin routes receive the admin layout and route guard. Server middleware independently protects admin pages and APIs, and admin writes require CSRF tokens. Credentials remain in the server environment; the settings page does not edit them.

| Admin route           | Function                      |
| --------------------- | ----------------------------- |
| `/admin`              | Dashboard                     |
| `/admin/blog`         | Blog publishing               |
| `/admin/events`       | Calendar content              |
| `/admin/messages`     | Private contact inbox         |
| `/admin/newsletters`  | Newsletter issues             |
| `/admin/subscribers`  | Subscription requests         |
| `/admin/reviews`      | Review moderation             |
| `/admin/jobs`         | Career openings               |
| `/admin/applications` | Private career applications   |
| `/admin/estimates`    | Demo quote preparation        |
| `/admin/auth`         | Local session-policy settings |

Dashboard links depend on enabled features. Admin and customer sessions are separate; a customer login does not grant administrator access.

### Customer accounts and requests

With `features.customer: 'local'`, customers can register at `/customer/login` using an email and a password of at least 12 characters. Registered accounts persist in SQLite. Optional `NUXT_CUSTOMER_EMAIL`, `NUXT_CUSTOMER_PASSWORD`, and `NUXT_CUSTOMER_NAME` values provision a separate preset account.

`/customer` is the account page. `/customer/workflows` lists owned demo appointments, estimates, and payments when enabled. Ownership is checked on the server against the authenticated account ID, not a client-supplied ID or email.

Local sessions default to eight hours with a 30-minute idle timeout; administrators can change the policy. Sessions are held in process memory, so restarting signs users out. Email verification and password recovery are not connected.

### Markdown publishing

Create a post at `/admin/blog`, enter its content and metadata, then publish it. Blog Markdown is stored in SQLite with separate title, slug, summary, author, media, SEO, and publication fields; posts are **not** stored as `.md` files.

The editor and public blog pages share Nuxt MDC and the custom components in `app/components/prose`. The toolbar inserts headings, formatting, tables, code, and custom blocks. A live preview updates as you type, with optional synchronized scrolling. Drafts and future publication dates are excluded from public results.

Example custom block:

```md
::post-callout{title="A useful detail"}
Your **formatted** message goes here.
::
```

Other blocks include `post-at-a-glance`, `post-cta-tile`, `centered-action`, `post-references`, `center-layout-flex`, and `phone-number`. Previewing content does not save it.

### Careers

`/careers` shows the landing page and open positions. Create openings at `/admin/jobs` and set their status to **open** to display them publicly. Job details link to `/careers/apply` with the role selected; general applications are also supported.

Applications are saved privately and reviewed at `/admin/applications`. Submitted applicant details remain read-only; administrators can update workflow status and internal notes. Applicants can include an optional HTTPS résumé/portfolio link. File uploads and application emails are not connected.

### Appointments, estimates, and payments

1. Sign in as a customer.
2. Use `/appointments` to select a service, meeting format, location/provider, and available business-timezone slot.
3. Manage the booking from `/customer/workflows`.
4. Submit a project request at `/estimates`.
5. As an admin, prepare a demo quote at `/admin/estimates`.
6. Return to the customer account to review and accept or decline it.

Payment simulation is available only when `site.features.payments` is enabled. It supports configured one-time items and accepted-estimate deposits without collecting card details. Notification jobs are queued only. Optional estimate attachments remain hidden until a private upload adapter is installed.

## Storage and architecture

### What survives a restart?

| Data                                                                                          | Current storage                         | Survives restart? |
| --------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------- |
| Registered customers and password hashes                                                      | `.data/customer-auth.sqlite` by default | Yes               |
| Blog, CMS content, private submissions, career applications, and auth policy settings         | `.data/management.sqlite` by default    | Yes               |
| Admin/customer sessions and local throttles                                                   | Server process memory                   | No                |
| Demo appointments, estimates, payments, receipts, idempotency attempts, and notification jobs | Server process memory                   | No                |

Keep SQLite files on a private persistent volume, outside `public/`, and back them up. Database paths can be changed with the existing environment variables. Production migrations, backup/restore verification, retention, and distributed coordination are tracked TODOs. The current in-memory workflow operations do not provide multi-server atomicity or restart recovery.

### Project structure

```text
app/
  api/               Transport, query handling, and normalized errors
  components/        Shared primitives, forms, content, sections, and admin UI
  composables/       Site access, UI state, authentication, and local workflows
  features/          Domain contracts, adapters, and feature state
  pages/             Public, admin, customer, and showcase routes
  theme/             Branding, tokens, packs, and section registries
server/
  api/               Local authentication, CMS, submissions, and workflow endpoints
  config/            Private integration defaults
  middleware/        Server authentication and response policies
  repositories/      Replaceable workflow storage
  services/          Workflow rules and state transitions
  utils/             Local stores, validation, auth, and integration access
shared/
  data/              Public content and configurable demo rules
  types/             Shared domain contracts
  utils/             Pure helpers used by browser and server
public/              Public static assets; never private storage
tests/              Unit and browser tests
docs/               Feature guides, integration audit, and deployment boundaries
```

Pages compose reusable sections and controls. Feature operations go through adapters into server authorization, validation, services, and repositories. Local cookie/CSRF transports and external backend transports have different responsibilities; the generic API client does not automatically forward incoming cookies or authorization headers.

Use shared `Forms*` controls, `Base*` interaction primitives, and theme tokens when extending the application. Add a section variant through the registry rather than duplicating a whole page. Start new features with contracts and server-owned rules; keep provider SDKs and credentials in server adapters.

## Development and checks

| Command                | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Development server                                    |
| `npm run typecheck`    | Strict Nuxt/Vue/TypeScript checks                     |
| `npm run lint`         | ESLint with zero warnings                             |
| `npm run lint:fix`     | Apply lint fixes                                      |
| `npm run format`       | Format the repository with Prettier                   |
| `npm run format:check` | Check formatting                                      |
| `npm test`             | Unit, contract, state, and utility tests              |
| `npm run test:ui`      | Playwright browser and axe accessibility checks       |
| `npm run build`        | Typecheck and production build                        |
| `npm run preview`      | Preview the production build                          |
| `npm run generate`     | Generate output for suitable content-only deployments |
| `npm run check`        | Lint, unit tests, typecheck, and build                |

Install Chromium before running browser tests:

```sh
npx playwright install chromium
npm run check
npm run test:ui
```

Browser tests start their own server on port `43188`. Stop the regular dev server before running the full checks to avoid Nuxt lock/generated-file conflicts. Some integration tests require matching `TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD` and server administrator credentials; supply them through the test environment. Tests can be skipped when their feature or prerequisite is unavailable—review the result rather than treating skips as coverage.

Automated checks cover important local behavior, but they do not establish real provider delivery, multi-instance consistency, or production readiness. Manual keyboard, Safari/iOS, and screen-reader checks remain release responsibilities.

## Deployment

The full application requires a server. Static-only hosting cannot enforce local authentication or provide CMS, private submissions, and workflow APIs.

For a Node deployment:

```sh
npm ci
npm run check
HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs
```

Deploy the generated `.output` artifact, provide runtime environment variables, use HTTPS, and mount private persistent storage for the SQLite files. Choose a deployment that supports Node 24 and the current local storage model. Multiple instances require shared sessions, rate limits, durable workflow transactions, and an appropriate database/storage strategy first.

Before publishing a client site:

- Replace template content, example testimonials/contact details, assets, and legal pages.
- Select supported features and finish the integrations those features need.
- Validate the real canonical origin, metadata, media, and public structured data.
- Keep indexing disabled on development and preview deployments.
- Set `NUXT_INDEXING_ENABLED=true` only after the production site and discovery output are reviewed.
- Test actual success, validation, ownership, expiry, cancellation, and provider failure paths.

`/robots.txt`, response indexing headers, and `/sitemap.xml` use the configured indexing policy. Sample/private content must not be promoted as real published data. See the integration audit for remaining sitemap and content-source work.

## Documentation

Start with the [documentation index](docs/README.md) for current-status terminology and guide navigation.

| Guide                                                          | Contents                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Authentication](docs/authentication.md)                       | Local accounts, guards, sessions and provider gaps                           |
| [Blog and content](docs/blog.md)                               | Database Markdown, live editing and publishing                               |
| [Careers](docs/careers.md)                                     | Job openings and private application review                                  |
| [Integration audit](docs/integration-audit.md)                 | Prioritized TODO IDs, completion criteria, and source anchors                |
| [Remaining work](docs/remaining-work.md)                       | Production integration overview                                              |
| [Configuration and secrets](docs/configuration-and-secrets.md) | Environment inventory, provider credentials, rotation, and encryption design |
| [Workflow foundations](docs/workflows.md)                      | Appointments, estimates, payments, uploads, outbox, and API boundaries       |
| [UI system](docs/ui-system.md)                                 | Themes, sections, tokens, and component conventions                          |
| [Feature contracts](docs/features.md)                          | Feature factories and local/external adapter boundaries                      |
| [API foundation](docs/application-api.md)                      | Transport and normalized error model                                         |
| [Core composables](docs/core-composables.md)                   | Shared configuration and runtime helpers                                     |
| [Events](docs/events.md)                                       | Calendar behavior, published content, and structured data                    |
| [Estimates](docs/estimates.md)                                 | Estimate workflow entry points                                               |
| [Request forms](docs/request-forms.md)                         | Appointment and contact behavior                                             |
| [Newsletter](docs/newsletter.md)                               | Presentation and provider boundaries                                         |
| [Reviews](docs/reviews.md)                                     | Review presentation and moderation context                                   |
| [Blog reference review](docs/blog-module-review.md)            | Blog implementation reference and design notes                               |
| [Dependency decisions](docs/package-todo.md)                   | Package choices and dated audit findings                                     |

Use stable `TODO [ID]` markers from the audit when completing integrations. Update the code anchors and documentation together when work is finished.

## Troubleshooting

- **Missing generated types:** run `npx nuxt prepare`, then `npm run typecheck`.
- **Port already in use:** run `npm run dev -- --port 3001`.
- **Admin login unavailable:** confirm local auth is enabled, set the administrator environment values, and restart the server.
- **Records disappeared after restart:** workflow records and sessions are intentionally in memory; check the storage table above.
- **A provider key appears to do nothing:** the placeholders do not install adapters. Check the relevant integration TODO.
- **Feature route returns 404:** check its flag in `shared/data/site.ts`.
- **Database cannot be opened:** confirm the private path, filesystem permissions, and persistent volume are available to the server process.

## Working on the foundation

Keep changes focused: one integration or feature boundary per commit is easier to review, test, and replace later. Preserve accessible controls and error states, enforce authorization and ownership on the server, and avoid hiding unfinished integrations behind simulated success.

The goal is a dependable base that can grow into a client-specific application with explicit, tested integration boundaries.
