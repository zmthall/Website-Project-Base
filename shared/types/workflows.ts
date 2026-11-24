// TODO [NOTIFY-01]: Connect email/SMS delivery with leased jobs, retry/backoff, deduplication and cancellation races; store delivery receipts and process provider failures without logging secrets/PII. See docs/integration-audit.md.
// TODO [PAY-01]: Implement Square/Stripe hosted checkout using private runtime keys, server-owned amounts and stable provider idempotency; keep demo outcomes separate from real payment state. See docs/integration-audit.md.
/** Amounts use integer minor units (USD cents), never floating-point currency. */
export interface Money {
  amount: number;
  currency: 'USD';
}
export interface ContactDetails {
  name: string;
  email: string;
  phone?: string;
}
export interface AttachmentReference {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}
export interface EstimateRequest {
  service: string;
  description: string;
  budget: string;
  timeline: string;
  contact: ContactDetails;
  company?: string;
  uploadIds?: string[];
  consent: true;
}
export type EstimateStatus =
  'requested' | 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'canceled';
export interface EstimateLineItem {
  description: string;
  quantity: number;
  unitAmount: number;
}
export interface Estimate {
  id: string;
  ownerId: string;
  request: EstimateRequest;
  attachments: AttachmentReference[];
  status: EstimateStatus;
  items: EstimateLineItem[];
  total: Money;
  expiresAt?: string;
  depositAmount: number;
  version: number;
  createdAt: string;
}
export interface QuoteInput {
  items: EstimateLineItem[];
  expiresAt: string;
  depositAmount: number;
  version: number;
}
export type PaymentStatus =
  'pending' | 'succeeded' | 'declined' | 'canceled' | 'failed' | 'expired';
export type PaymentPurpose =
  { type: 'one-time'; productId: string } | { type: 'estimate-deposit'; estimateId: string };
export interface PaymentSession {
  id: string;
  ownerId: string;
  purpose: PaymentPurpose;
  total: Money;
  status: PaymentStatus;
  provider: 'demo' | 'hosted';
  providerSessionId: string;
  checkoutUrl?: string;
  expiresAt: string;
  verifiedAt?: string;
  receipt?: PaymentReceipt;
}
export interface PaymentReceipt {
  id: string;
  paymentId: string;
  total: Money;
  paidAt: string;
  simulated: boolean;
}
export interface NotificationJob {
  id: string;
  ownerId: string;
  resourceId: string;
  kind:
    | 'appointment-confirmed'
    | 'appointment-rescheduled'
    | 'appointment-canceled'
    | 'appointment-reminder'
    | 'estimate-requested'
    | 'estimate-quoted'
    | 'estimate-decided'
    | 'payment-receipt';
  dueAt: string;
  status: 'queued' | 'canceled';
}
export interface WorkflowCoreRepository {
  notifications: Map<string, NotificationJob>;
  attempts: Map<string, { fingerprint: string; result: unknown }>;
}
export interface WorkflowRepository extends WorkflowCoreRepository {
  estimates: Map<string, Estimate>;
  payments: Map<string, PaymentSession>;
}
/** Uploads adapter must authenticate ownership and verify ready/scanned private objects. */
export interface UploadResolver {
  resolve(ownerId: string, ids: string[]): AttachmentReference[];
}
/** Production providers own hosted checkout and verify signed events/server-side status. */
export interface PaymentProvider {
  create(paymentId: string, total: Money): { id: string; checkoutUrl?: string };
  verify(providerSessionId: string): PaymentStatus;
}
/** Delivery adapter consumes queued outbox jobs; success must be persisted by its worker. */
export interface NotificationDispatcher {
  deliver(job: NotificationJob): Promise<{ providerMessageId: string }>;
}
/** Async production integration seam; implement this alongside durable transactions/outbox. */
export interface HostedPaymentGateway {
  createHostedSession(input: {
    paymentId: string;
    total: Money;
    idempotencyKey: string;
    returnUrl: string;
  }): Promise<{ providerSessionId: string; checkoutUrl: string }>;
  retrieveStatus(providerSessionId: string): Promise<{ status: PaymentStatus; total: Money }>;
  verifyWebhook(
    rawBody: Uint8Array,
    signature: string,
  ): Promise<{ eventId: string; providerSessionId: string; status: PaymentStatus; total: Money }>;
}
