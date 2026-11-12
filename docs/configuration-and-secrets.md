# Configuration and secrets

## Recommended arrangement

Use `.env` for local development and the deployment platform's secret manager/injected environment for production. `.env.example` is the complete blank template; never put live credentials there. Non-secret provider names, scheduling rules and public site content can stay in versioned TypeScript configuration. No extra root `config.json` loader is introduced: an ignored JSON file would still be plaintext and would add a second configuration/precedence mechanism without protecting secrets.

The private keys are declared under `runtimeConfig.integrations` in `nuxt.config.ts`, with defaults in `server/config/integrations.ts`. Future adapters can read them with `serverIntegrations(event)` from `server/utils/integration-config.ts`. These values are server-only. Never serialize that object to an API response, Vue state, logs or `runtimeConfig.public`.

Nuxt loads `.env` for local CLI workflows. A built server does **not** automatically load it; inject environment variables through the hosting platform, container secret configuration or a deliberate runtime env-file mechanism. Matching `NUXT_` names override the declared runtime-config properties. See [Nuxt runtime configuration](https://nuxt.com/docs/4.x/guide/going-further/runtime-config).

**Adding credentials does not connect a provider.** The new settings are recognized placeholders for future adapters. Current auth/CMS uses its existing SQLite files and environment presets; workflows still use process-local memory and the card-free demo provider. `site.features` controls feature availability, not provider readiness. `CONFIG-01` requires fail-closed validation and real adapter registration before any integration is enabled.

## Configuration inventory

| Area                 | Environment prefix / existing keys      | Current behavior                                           | Future connection                                                 |
| -------------------- | --------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| API transport        | `NUXT_PUBLIC_API_BASE`, `NUXT_API_BASE` | Implemented; public base contains no credentials           | Trusted external backend transport                                |
| Local accounts       | `NUXT_ADMIN_*`, `NUXT_CUSTOMER_*`       | Implemented local preset accounts and customer SQLite      | Managed provisioning, MFA/recovery, identity adapter              |
| Local CMS            | `NUXT_MANAGEMENT_DATABASE`              | Implemented SQLite content/private submissions             | Migrations, backups, optional database adapter                    |
| Workflow database    | `NUXT_INTEGRATIONS_DATABASE_*`          | Reserved, memory remains active                            | Transactional SQL repository with migrations and TLS              |
| Shared sessions      | `NUXT_INTEGRATIONS_SESSIONS_*`          | Reserved, process-local sessions remain active             | Redis/shared sessions, TTL/revocation and distributed rate limits |
| Payments             | `NUXT_INTEGRATIONS_PAYMENTS_*`          | Reserved, demo remains active; feature disabled by default | Square or Stripe hosted checkout and verified webhooks            |
| Transactional mail   | `NUXT_INTEGRATIONS_EMAIL_*`             | Reserved, outbox only                                      | API or SMTP adapter, sender verification and delivery worker      |
| Newsletter           | `NUXT_INTEGRATIONS_NEWSLETTER_*`        | Reserved, local requested subscribers                      | List provider, confirmation/unsubscribe and webhook sync          |
| Private uploads      | `NUXT_INTEGRATIONS_UPLOADS_*`           | Reserved, no object store                                  | Private storage/identity and scanned ownership resolver           |
| Firebase/Supabase    | `NUXT_INTEGRATIONS_IDENTITY_*`          | Reserved, local auth remains selected                      | Server identity verification; mounted/managed credentials         |
| Search               | `NUXT_INTEGRATIONS_SEARCH_*`            | Reserved, local public search helpers                      | Server-scoped remote index adapter                                |
| Bot protection       | `NUXT_INTEGRATIONS_SPAM_*`              | Reserved, local throttles remain                           | Server token verification; explicit public site-key projection    |
| Telemetry            | `NUXT_INTEGRATIONS_OBSERVABILITY_*`     | Reserved                                                   | Redacted server traces/metrics/error reporting                    |
| Secret manager/vault | `NUXT_INTEGRATIONS_SECRETS_*`           | Reserved; no encrypted credential table                    | Managed secret retrieval or audited envelope encryption           |

### Square

Fill the sandbox deployment's application ID, location ID and access token only after installing the Square adapter. Use separate production deployment credentials. The webhook signature key and **exact registered HTTPS notification URL** are separate settings; Square validation depends on that URL, the raw request body and the signature key. A signature check must happen before processing a webhook. See [Square webhook validation](https://developer.squareup.com/docs/webhooks/step3validate) and [production setup](https://developer.squareup.com/docs/webhooks/movetoprod).

Application/location IDs are identifiers; the access token and webhook signature key are secrets. Keep everything server-side by default and expose only the identifiers a selected hosted/browser SDK actually needs through a narrowly scoped configuration response. Do not expose the whole payment config.

### Stripe or another processor

The placeholders include a publishable key, server key and separate webhook signing secret. Prefer a restricted server key where its permissions cover the implementation. Never send server keys or webhook secrets to the browser. Stripe explicitly distinguishes publishable, restricted, secret and webhook credentials in [its key documentation](https://docs.stripe.com/keys). Add a new processor as an implementation of `HostedPaymentGateway`, with its own private config group, rather than putting arbitrary provider URLs/tokens into client request bodies.

No card number, security code or payment-provider secret belongs in this application's database, generic form schema or request logs. Use provider-controlled checkout/tokenization; verify the final amount/currency/session server-side. The existing demo receipt is never proof of a real payment.

## Hashing versus encryption

- User passwords: use one-way password hashing with a unique salt and appropriate work factor. Registered local customers already use scrypt. There is no legitimate “unhash” operation.
- API credentials: the server must recover the original token to call its provider. Use a secret manager, or authenticated encryption if database-backed secret storage is truly needed.
- Keeping a database token encrypted with a key stored beside it in the same database does not establish the intended separate trust boundary.

For a future database credential vault (`SECRETS-02`), store ciphertext, a fresh nonce, authentication tag, key ID/version and purpose/tenant binding. Keep the encryption key or key-encryption key in KMS/the deployment secret manager **outside the database**. Use an established authenticated-encryption implementation; do not invent a cipher or derive the master key from an administrator password. Database readers/backups should not automatically obtain decryption access. Enforce write-only secret changes, masked readiness displays, least-privilege decrypt access, CSRF protection, audit records without values, and key rotation/re-encryption/recovery procedures. Encryption does not protect against an already-compromised process that legitimately decrypts secrets.

The encryption/KMS environment fields are explicitly reserved and unused. No generated key, ciphertext format, cryptographic claim or secret-editing endpoint is implemented by this audit. Follow [OWASP secret management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) and [key management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) when implementing that layer.

## Handling and rotation

1. Create separate sandbox/staging/production credentials with minimum provider permissions. Prefer managed workload identity or short-lived credentials where supported.
2. Assign each credential an owner, revocation location and rotation cadence. Do not log values while diagnosing missing configuration.
3. Store local values only in ignored `.env`; provide production values through the deployment secret mechanism. Keep `.env.example` blank for secrets. Local JSON/config/private-key files are ignored defensively, but ignoring is not encryption.
4. On exposure, revoke/rotate at the provider first, update deployments, audit use, then remove leaked material from source/history with the team. Removing a file alone does not revoke a leaked key.
5. Under `OPS-03`, install and pin a secret scanner in local staged-change hooks and CI. It is not installed in this environment; no completed secret-scan claim is made.

## Tests and audit tracking

`tests/integration-config.test.ts` verifies that every new environment placeholder maps to a private declared default, secret defaults are empty, and the TODO registry has real code anchors. It checks structure without loading `.env` or printing credentials. The normal build/typecheck verifies Nuxt's private config types; existing workflow tests remain the source of behavioral evidence.

All open tasks and priority/completion criteria are indexed in [integration-audit.md](integration-audit.md). Keep IDs stable when moving work; remove code TODOs and update the index only after the integration and its acceptance tests exist.
