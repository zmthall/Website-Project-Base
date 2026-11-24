# Local authentication and accounts

## Implemented locally

Admin and customer authentication are separate. Both use opaque HttpOnly session cookies, CSRF-protected writes, expiry and route/server guards. Customer authentication never grants an administrator role. Only `local` is implemented; Firebase and Supabase values are reserved and fail closed without their adapters.

## Account and session flow

| Area                         | Setup / behavior                                                                                     | Persistence                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Admin                        | Set `NUXT_ADMIN_EMAIL`, `NUXT_ADMIN_PASSWORD`, optional `NUXT_ADMIN_NAME`; sign in at `/admin/login` | Preset from server environment          |
| Registered customer          | Register at `/customer/login` with email and password of at least 12 characters                      | Salted scrypt hashes in customer SQLite |
| Preset customer              | Optional `NUXT_CUSTOMER_EMAIL`, `NUXT_CUSTOMER_PASSWORD`, `NUXT_CUSTOMER_NAME`                       | Preset from server environment          |
| Sessions and login throttles | Separate admin/customer stores and cookies                                                           | Process memory; lost on restart         |
| Session policies             | Admin/customer duration and idle limits set at `/admin/auth`                                         | Management SQLite                       |

The default session duration is eight hours with a 30-minute idle timeout. Registered local accounts are not email verified. Password recovery, email delivery, MFA and expanded account administration are not connected.

Global route middleware selects the admin/customer layout and performs client checks. Server middleware independently protects their pages and APIs. Auth bootstrap/login/logout and customer registration have intentional exceptions; mutation endpoints still require their appropriate CSRF token. Layout choice and hidden navigation alone are not authorization.

Workflow ownership is derived from the authenticated customer's account ID. The workflow handlers separately enforce identity and CSRF because their routes live under `/api/workflows`, not `/api/customer`.

## Configuration

Provider flags: `site.features.administrator` and `site.features.customer`. Private customer storage: `NUXT_CUSTOMER_DATABASE`. Policies/content: `NUXT_MANAGEMENT_DATABASE`. Use HTTPS in production and private persistent volumes for SQLite. Restart after changing preset credentials.

Administrator authentication is packaged under `feature-layers/administrator/`. The layer owns its public client contract/store, plugins, composable, route guard, protected layout, login/dashboard/settings UI, server middleware, session service, API endpoints and dedicated tests. Generic policy persistence, bounded request parsing, management metadata and constant-time secret comparison remain shared integration seams.

Customer authentication is packaged under `feature-layers/customer/`. The layer owns registration and session APIs, account persistence, client contract/store, plugins, composable, route guard, protected layout, account pages, runtime defaults and dedicated tests. The `/customer/workflows` page remains a shared account dashboard because it composes Appointments, Estimates and Payments; those features depend on Customer's server authorization contract rather than duplicating it.

Future shared-session and identity placeholders live under `NUXT_INTEGRATIONS_SESSIONS_*` and `NUXT_INTEGRATIONS_IDENTITY_*`; they do not replace the local implementation automatically. Do not put secrets in public runtime config or returned account profiles.

## What remains

- AUTH-01: shared expiring sessions/limits, revocation, proxy/origin review and replica/restart tests.
- AUTH-02: real identity-provider verification, recovery and email verification.
- AUTH-03: managed provisioning, MFA, password/account lifecycle and audited role changes.
- DB-02/ADMIN-01: schema migrations, backup/restore and privileged access audit.
- SECRETS-01/CONFIG-01: scoped secret retrieval and provider readiness validation.

Source anchors and acceptance criteria: [integration-audit.md](integration-audit.md). Secret storage: [configuration-and-secrets.md](configuration-and-secrets.md).

## Verification

Exercise admin/customer sign-in/out independently, registration, expired sessions, CSRF, role boundaries and cross-account resource access. Test new provider/recovery behavior against the real selected adapter before describing it as implemented. Static hosting cannot enforce these server guards.
