// TODO [BOOK-01]: Add provider-specific schedules, holidays, duration/buffer and location capacity rules with transactional overlap constraints, timezone/DST tests and authoritative clock handling. See docs/integration-audit.md.
/** Process-local scheduling with ownership, conflict/version checks and an outbox. */
export type * from './types';
export { createAppointmentsApi } from './api';
export { appointments, appointmentWorkflow } from '../../../shared/appointments';
