# Estimate requests and review

## Implemented locally

`/estimates` accepts requests from signed-in customers using the shared form system. Records belong to the server-authenticated account ID and are stored in the process-local workflow repository. They reset when the server restarts.

## Request-to-decision flow

1. The customer chooses project type, budget and timeline, supplies project/contact details and confirms the simulation notice.
2. `/api/workflows/estimates` validates and records the request with a stable idempotency key.
3. An administrator opens `/admin/estimates`, prepares line items and an expiry, and sends a demo quote. The current editor offers one line; the API supports up to 50.
4. The server calculates integer USD-cent totals and bounds the deposit.
5. The owner reviews the quote at `/customer/workflows`, then accepts or declines an unexpired version.
6. If payments are explicitly enabled, an accepted estimate with a deposit can create a demo payment session.

The implemented path is `requested → sent → accepted / declined / expired`. `draft` and `canceled` exist in the contract for future authoring/withdrawal behavior. A request is not automatically priced and the simulation is not a binding offer. No quote email is sent.

## Configuration and integration boundaries

Choices live in `feature-layers/estimates/shared/estimates.ts`; decisions/deposits are configured in `shared/data/workflows.ts`. Estimate and payment availability have separate site feature flags.

Optional attachments use the active local private upload provider plus a server-owned `UploadResolver`. The picker appears only when the uploads feature and resolver are configured. The server verifies ownership, expiry and ready/inspected state; a caller-supplied file ID is not enough. Claimed attachment metadata is stored with the Estimate and the owning customer receives a private download link.

## What remains

- DB-01: durable requests, versions, idempotency and outbox transactions.
- EST-01: audited multi-line revisions, requotes, withdrawal and pricing/currency rules.
- EST-02/UPLOAD-01: private storage endpoints, scanned attachment ownership and cleanup.
- PAY-01–04: actual hosted deposits, signed events, receipts/reconciliation and future invoices/refunds.
- NOTIFY-01: actual quote notifications and delivery state.

See [workflows.md](workflows.md) for endpoint/contracts and [integration-audit.md](integration-audit.md) for acceptance criteria.

## Verification

Domain tests cover totals, versions, ownership, expiry, decisions and upload resolver checks. Browser/API tests cover private requests, admin CSRF and customer acceptance. Durable restart recovery and real provider behavior require integration tests after those adapters exist.
