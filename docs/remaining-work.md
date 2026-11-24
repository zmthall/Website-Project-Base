# Remaining integration work

The local foundation now includes admin/customer authentication, PostgreSQL public/editorial CMS content, careers and local request processing. Appointments, estimates and payments have process-local repositories and executable contracts; see [workflows.md](workflows.md). These workflow records deliberately do **not** use a database yet.

## Implemented workflow foundations

- Appointments: business-timezone availability, locations/providers, scheduling rules, overlap/conflict checks, versioned booking/rescheduling/cancellation, ownership and a notification outbox.
- Estimates: private requests, upload resolver seam, admin quotes, server totals, expiry, customer decisions and accepted-estimate deposit references.
- Payments: typed session/receipt/status boundaries, configured one-time payments and deposits, card-free demo provider, verified server status and idempotent attempts. Disabled by default; no real charges.
- Events: published CMS records feed the calendar; complete published events produce structured data. Registration remains intentionally deferred.
- Customer records are reviewed at `/customer/workflows`. Administrators quote requests at `/admin/estimates`.

## Still needed for production

- Replace process-local workflow maps with durable transactional repositories, slot constraints and persistent idempotency. Prove concurrency across processes and recovery after restarts.
- Replace the functional local upload provider's conservative scanner/filesystem storage with deployment-approved malware scanning and object storage when production requirements demand it. Add a durable cleanup worker and multi-instance quota coordination.
- Select a hosted payment provider. Implement signed webhook verification, authoritative amount/currency reconciliation, durable receipts, provider retries/refunds and reconciliation workers. No raw card handling or real checkout is implemented.
- Install notification delivery workers and an email/SMS provider. Outbox jobs are queued only. Add deduplicated delivery, preferences and retention.
- Add invoice contracts and an authoritative invoice resolver before allowing invoice payments. Draft/withdrawal/requote estimate authoring can be expanded beyond the implemented request/quote/decision path.
- Event registration/capacity remains a later explicit opt-in, requiring atomic capacity checks and cancellation policies.
- Connect configured identity providers/recovery/verification if moving beyond local admin/customer authentication.
- Complete real Safari and assistive-technology checks; validate deployment HTTPS/CSP/cache requirements and provider integration failure scenarios.
- Replace sample client content/assets/legal copy and choose each optional feature deliberately. Workflow simulation labels must remain until real providers and persistence replace the demo.

Blog posts, events, reviews, business information, FAQs, media references and aggregate ratings use PostgreSQL. Private contact messages, newsletter subscription requests, career applications, local auth policy and upload metadata retain their scoped local stores; this remains separate from the in-memory workflow repositories. Hosted search scaling/abuse controls, provider-specific email/list integrations, production upload storage, persistent theme editing and the roadmap's separate client demonstration sites remain follow-up work. See the individual feature documents and dependency decision log for those integration boundaries.

## Project-wide integration audit

The detailed audit is now indexed in [integration-audit.md](integration-audit.md), with stable TODO IDs and code anchors across server repositories/routes, authentication, providers, shared forms, customer/admin flows, content, SEO, privacy, deployment and tests. See [configuration-and-secrets.md](configuration-and-secrets.md) for the private `.env.example` inventory and the distinction between passwords, API secrets and optional encrypted database storage. Filling placeholders does not activate an unimplemented provider.

## Recommended integration sequence

1. Resolve client-specific content/privacy requirements and baseline operational gaps (CONTENT-01, PRIVACY-01, OPS-01–03).
2. Establish durable repositories, migrations and shared identity/session behavior (DB-01–02, AUTH-01–03).
3. Install provider adapters with private configuration/readiness and scoped secrets (CONFIG-01, SECRETS-01).
4. Connect uploads and delivery, then real hosted payments and verified reconciliation (UPLOAD-01, NOTIFY-01, PAY-01–03).
5. Expand optional authoring, invoices, registration and persistent theme editing only when required (EST-01, PAY-04, EVENT-01, THEME-01).
6. Run the documented provider/restart/concurrency and real-device accessibility acceptance checks before changing simulation labels.

Documentation entry point: [docs/README.md](README.md). The audit remains the canonical task register; feature guides explain current operation and reference those IDs rather than maintaining competing task lists.
