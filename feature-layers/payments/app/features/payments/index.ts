// TODO [PAY-04]: Add an owner-checked invoice resolver and refund/dispute/partial-payment lifecycle, reconciliation jobs and downloadable verified receipts before exposing invoice payments. See docs/integration-audit.md.
// TODO [PAY-01]: Implement Square/Stripe hosted checkout using private runtime keys, server-owned amounts and stable provider idempotency; keep demo outcomes separate from real payment state. See docs/integration-audit.md.
/** Card-free simulation. A production provider must use hosted checkout and server verification. */
export type {
  PaymentSession,
  PaymentPurpose,
  PaymentReceipt,
  PaymentStatus,
  PaymentProvider,
  Money,
} from '#shared/types/workflows';
export { createPaymentsApi } from './api';
