// TODO [NOTIFY-01]: Connect email/SMS delivery with leased jobs, retry/backoff, deduplication and cancellation races; store delivery receipts and process provider failures without logging secrets/PII. See docs/integration-audit.md.
// TODO [DB-01]: Replace process-local maps with migrations and transactional repositories; persist idempotency, slot constraints, outbox and reconciliation across server instances. See docs/integration-audit.md.
import type { WorkflowRepository } from '../../shared/types/workflows';
import type { AppointmentRepository } from '../../feature-layers/appointments/server/services/appointments';
/** One process, no persistence. Replace this with transactional durable storage later. */
export function createMemoryWorkflowRepository(): WorkflowRepository & AppointmentRepository {
  return {
    appointments: new Map(),
    estimates: new Map(),
    payments: new Map(),
    notifications: new Map(),
    attempts: new Map(),
  };
}
export const workflowRepository = createMemoryWorkflowRepository();
