# Application architecture and API transports

## Implemented locally

The Nuxt server now provides local authentication, CMS/public content, contact/review/newsletter/career submissions, and simulated appointment/estimate/payment workflows. Discovery endpoints are generated at runtime. It is no longer an SEO-only server.

Public content lives in `shared/data/site.ts` and related files. Serializable visual defaults originate in `app/theme/config.ts` and are exposed through app configuration. Private settings belong in `runtimeConfig`, including the `integrations` group. No private config object should be serialized to a page or API response.

## Request flow

```text
Page / shared controls
  → feature adapter or local composable
  → server feature/auth/CSRF checks
  → runtime validation
  → domain service
  → repository / provider boundary
```

| Transport                        | Intended use                                                | Authentication behavior                                                                                      |
| -------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `$api` / `createApiClient`       | Injected local/remote backend-relative operations           | Anonymous by default, credentials omitted, no incoming SSR header forwarding; optional injected bearer token |
| Admin/customer auth adapters     | Local account lifecycle                                     | Same-origin cookie sessions; explicit CSRF on writes                                                         |
| `useAdminManagement`             | Local content and policy administration                     | Admin `authorized` callback supplies CSRF                                                                    |
| `useWorkflows`                   | Local customer workflows                                    | Cookie ownership and customer CSRF; public availability reads need no session                                |
| Page-local `useFetch` / `$fetch` | Published reads and implemented public submission endpoints | Handler-specific feature, consent and abuse checks                                                           |

Do not assume an external feature factory's complete endpoint set exists locally. Newsletter confirmation/preferences, remote search and upload storage remain examples of unconnected operations. API-01 tracks route/adapter reconciliation.

## Generic client contract

Capture `$api` inside setup, a composable or a plugin. Use `useAsyncData` for SSR reads so Nuxt transfers the result through its payload. Pass query data through `query`; the client accepts backend-relative paths rather than arbitrary URLs. Responses are returned unchanged, including any backend envelope.

The generic client sets a 15-second default timeout, accepts an override and AbortSignal, refuses redirects and disables automatic retries. Ofetch handles JSON, query arrays and FormData boundaries. Credentials are omitted unless a deliberately different transport is supplied.

Bearer integrations can inject `getToken` and an `onUnauthorized` notification. `{ auth: true }` requests opt in to token attachment. Refresh/retry/navigation remain the auth layer's responsibility. Never forward arbitrary incoming cookies to a separately configured backend.

`ApiError` normalizes HTTP/network/timeout/cancellation failures into local safe text, optional status/code and field errors. Raw provider diagnostics and headers must not be displayed. Local workflow handlers currently return bounded domain validation/status messages; production providers need redacted error translation under API-02/OPS-01.

## Environment and deployment

`NUXT_PUBLIC_API_BASE` defaults to `/api`. `NUXT_API_BASE` is an optional trusted SSR override; both should identify the same logical backend. A separate browser origin needs intentional CORS/session design. Neither URL should contain credentials.

Personalized APIs are uncached by default. Admin/customer pages have no-store/noindex rules and independent server guards. Public page caching is opt-in. `/robots.txt` and `/sitemap.xml` are Nitro routes; indexing is off unless explicitly enabled for a real configured origin. Static-only deployments cannot provide the local authenticated APIs.

Production Node servers do not automatically load `.env`. See [configuration-and-secrets.md](configuration-and-secrets.md) for private settings and runtime injection. Baseline headers are present; deployment-specific CSP, HTTPS/proxy behavior and telemetry remain OPS-01.

## What remains

| TODO            | Required addition                                                                            |
| --------------- | -------------------------------------------------------------------------------------------- |
| API-01          | Reconcile every external adapter with its deployed endpoint and trusted credential transport |
| API-02          | Shared runtime schemas, route-specific limits and safe provider error translation            |
| CONFIG-01       | Selected-provider readiness validation and fail-closed activation                            |
| AUTH-01 / DB-01 | Distributed sessions/limits and durable workflow transactions                                |
| OPS-01–03       | Deployment hardening, authenticated integration CI, dependencies and secret scanning         |

See [integration-audit.md](integration-audit.md) for acceptance criteria and source anchors.

## Verification

Run `npm test`, `npm run typecheck`, `npm run build` and the relevant Playwright suites. Typechecking runs before the build rather than inside Vite because the inline checker mishandles this workspace's spaced path. Dated dependency findings are in [package-todo.md](package-todo.md); they are not current scan results.
