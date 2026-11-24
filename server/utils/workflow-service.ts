// TODO [NOTIFY-01]: Connect email/SMS delivery with leased jobs, retry/backoff, deduplication and cancellation races; store delivery receipts and process provider failures without logging secrets/PII. See docs/integration-audit.md.
// TODO [PAY-02]: Add raw-body signed webhook endpoints, event-ID deduplication and amount/currency/session reconciliation in durable transactions; never trust redirects as proof of payment. See docs/integration-audit.md.
// TODO [EST-02]: Persist Estimate creation and upload-claim retention in one durable transaction before production deployment. See docs/integration-audit.md.
// TODO [DB-01]: Replace process-local maps with migrations and transactional repositories; persist idempotency, slot constraints, outbox and reconciliation across server instances. See docs/integration-audit.md.
// TODO [CONFIG-01]: Wire selected adapters to private runtime config; validate required settings, reject unsupported providers and report only sanitized readiness. See docs/integration-audit.md.
import { workflowRepository } from '../repositories/workflows';
import { WorkflowService } from '../services/workflows';
export const workflowService = new WorkflowService(workflowRepository);
