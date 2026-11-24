// TODO [PAY-01]: Implement Square/Stripe hosted checkout using private runtime keys, server-owned amounts and stable provider idempotency; keep demo outcomes separate from real payment state. See docs/integration-audit.md.
// TODO [EST-01]: Add audited multi-line revisions/requote/withdrawal policies, tax/discount/currency rules and durable acceptance evidence; preserve accepted versions when quoting changes. See docs/integration-audit.md.
// TODO [BOOK-01]: Add provider-specific schedules, holidays, duration/buffer and location capacity rules with transactional overlap constraints, timezone/DST tests and authoritative clock handling. See docs/integration-audit.md.
import { randomUUID } from 'node:crypto';
import { workflows } from '../../shared/data/workflows';
import { estimates as estimateChoices } from '../../feature-layers/estimates/shared/estimates';
import type {
  EstimateRequest,
  QuoteInput,
  PaymentPurpose,
  PaymentStatus,
  PaymentProvider,
  UploadResolver,
  WorkflowRepository,
  Money,
} from '../../shared/types/workflows';
import {
  fail,
  validText as text,
  validateContact,
  WorkflowServiceSupport,
} from './workflow-support';
/** Server-owned demo status; no redirect/query parameter can mark a payment paid. */
export class DemoPaymentProvider implements PaymentProvider {
  private statuses = new Map<string, PaymentStatus>();
  create(paymentId: string, _total: Money) {
    this.statuses.set(paymentId, 'pending');
    return { id: paymentId };
  }
  verify(id: string) {
    return this.statuses.get(id) ?? 'failed';
  }
  simulate(id: string, outcome: PaymentStatus) {
    if (!['pending', 'succeeded', 'declined', 'canceled', 'failed'].includes(outcome))
      fail(400, 'Invalid demo outcome');
    if (this.statuses.get(id) !== 'pending') fail(409, 'Demo provider session is already settled');
    this.statuses.set(id, outcome);
  }
}
export class WorkflowService extends WorkflowServiceSupport<WorkflowRepository> {
  constructor(
    repo: WorkflowRepository,
    now = () => Date.now(),
    private provider: PaymentProvider = new DemoPaymentProvider(),
    private uploads?: UploadResolver,
  ) {
    super(repo, now);
  }
  configureUploads(resolver: UploadResolver) {
    this.uploads = resolver;
  }
  get uploadsConfigured() {
    return Boolean(this.uploads);
  }
  requestEstimate(owner: string, input: EstimateRequest, key: string, allowUploads = false) {
    return this.repeat(owner, 'estimate-request', key, input, () => {
      validateContact(input.contact);
      if (
        input.consent !== true ||
        !text(input.description, 10000) ||
        input.description.trim().length < 20 ||
        !estimateChoices.services.some((s) => s.value === input.service) ||
        !estimateChoices.budgets.some((s) => s.value === input.budget) ||
        !estimateChoices.timelines.some((s) => s.value === input.timeline) ||
        (input.company !== undefined &&
          (typeof input.company !== 'string' || input.company.length > 200))
      )
        fail(400, 'Check project details and consent');
      const ids = input.uploadIds ?? [];
      if (
        !Array.isArray(ids) ||
        ids.some((id) => typeof id !== 'string') ||
        ids.length > workflows.estimates.maxAttachments ||
        new Set(ids).size !== ids.length
      )
        fail(400, 'Invalid attachment references');
      if (ids.length && (!allowUploads || !this.uploads))
        fail(503, 'Private upload storage is not configured');
      const attachments = ids.length ? this.uploads!.resolve(owner, ids) : [];
      if (attachments.length !== ids.length || attachments.some((a) => !ids.includes(a.id)))
        fail(400, 'Attachments must be owned and ready');
      const record = {
        id: randomUUID(),
        ownerId: owner,
        request: structuredClone(input),
        attachments,
        status: 'requested' as const,
        items: [],
        total: { amount: 0, currency: 'USD' as const },
        depositAmount: 0,
        version: 1,
        createdAt: new Date(this.now()).toISOString(),
      };
      this.repo.estimates.set(record.id, record);
      this.notify(owner, record.id, 'estimate-requested');
      return record;
    });
  }
  private expireEstimate(id: string) {
    const e = this.repo.estimates.get(id);
    if (e?.status === 'sent' && Date.parse(e.expiresAt!) <= this.now()) {
      e.status = 'expired';
      e.version++;
    }
    return e;
  }
  listEstimates(owner?: string) {
    for (const id of this.repo.estimates.keys()) this.expireEstimate(id);
    return structuredClone(
      [...this.repo.estimates.values()].filter((e) => !owner || e.ownerId === owner),
    );
  }
  getEstimate(owner: string, id: string) {
    this.expireEstimate(id);
    return structuredClone(this.owned(this.repo.estimates, id, owner));
  }
  quote(id: string, input: QuoteInput) {
    const e = this.expireEstimate(id);
    if (!e) return fail(404, 'Estimate not found');
    if (!['requested', 'draft'].includes(e.status) || input.version !== e.version)
      return fail(409, 'Estimate changed or cannot be quoted');
    if (
      !Array.isArray(input.items) ||
      !input.items.length ||
      input.items.length > 50 ||
      input.items.some(
        (i) =>
          !i ||
          typeof i !== 'object' ||
          !text(i.description, 200) ||
          !Number.isSafeInteger(i.quantity) ||
          i.quantity < 1 ||
          i.quantity > 10000 ||
          !Number.isSafeInteger(i.unitAmount) ||
          i.unitAmount < 0,
      ) ||
      !text(input.expiresAt) ||
      !Number.isFinite(Date.parse(input.expiresAt)) ||
      Date.parse(input.expiresAt) <= this.now()
    )
      fail(400, 'Enter valid line items and future expiry');
    const total = input.items.reduce((sum, i) => sum + i.quantity * i.unitAmount, 0);
    if (
      !Number.isSafeInteger(total) ||
      total < 1 ||
      total > 100000000 ||
      !Number.isSafeInteger(input.depositAmount) ||
      input.depositAmount < 0 ||
      input.depositAmount > total
    )
      fail(400, 'Invalid total or deposit');
    Object.assign(e, {
      items: structuredClone(input.items),
      total: { amount: total, currency: 'USD' },
      depositAmount: input.depositAmount,
      expiresAt: new Date(input.expiresAt).toISOString(),
      status: 'sent',
      version: e.version + 1,
    });
    this.notify(e.ownerId, id, 'estimate-quoted');
    return structuredClone(e);
  }
  decide(
    owner: string,
    id: string,
    decision: 'accepted' | 'declined',
    version: number,
    key: string,
  ) {
    return this.repeat(owner, `estimate:${id}`, key, { decision, version }, () => {
      const e = this.getEstimate(owner, id);
      if (!workflows.estimates.acceptanceEnabled || !['accepted', 'declined'].includes(decision))
        return fail(400, 'Estimate decisions are disabled or invalid');
      if (e.status !== 'sent' || e.version !== version)
        return fail(409, 'Estimate changed, expired or was already decided');
      e.status = decision;
      e.version++;
      this.repo.estimates.set(id, e);
      this.notify(owner, id, 'estimate-decided');
      return e;
    });
  }
  createPayment(owner: string, purpose: PaymentPurpose, key: string) {
    if (
      !purpose ||
      typeof purpose !== 'object' ||
      Object.keys(purpose).some(
        (k) => !['type', purpose.type === 'one-time' ? 'productId' : 'estimateId'].includes(k),
      )
    )
      return fail(400, 'Only a configured payment reference is accepted');
    return this.repeat(owner, 'payment', key, purpose, () => {
      let amount: number;
      if (purpose?.type === 'one-time') {
        const product = workflows.payments.products.find((p) => p.id === purpose.productId);
        if (!product) return fail(400, 'Unknown payment item');
        amount = product.amount;
      } else if (purpose?.type === 'estimate-deposit') {
        const e = this.getEstimate(owner, purpose.estimateId);
        if (!workflows.estimates.depositsEnabled || e.status !== 'accepted' || e.depositAmount < 1)
          return fail(409, 'No deposit is payable');
        amount = e.depositAmount;
        const attempts = [...this.repo.payments.values()].filter(
          (p) =>
            p.ownerId === owner &&
            p.purpose.type === 'estimate-deposit' &&
            p.purpose.estimateId === e.id,
        );
        for (const attempt of attempts) {
          const verified = this.verifyPayment(owner, attempt.id);
          if (verified.status === 'succeeded') return fail(409, 'Deposit already paid');
          if (verified.status === 'pending') return verified;
        }
      } else return fail(400, 'Invalid payment purpose');
      const id = randomUUID();
      const total = { amount, currency: 'USD' as const };
      const session = this.provider.create(id, total);
      const payment = {
        id,
        ownerId: owner,
        purpose: structuredClone(purpose),
        total,
        provider: workflows.payments.provider,
        providerSessionId: session.id,
        checkoutUrl: session.checkoutUrl,
        status: 'pending' as const,
        expiresAt: new Date(this.now() + workflows.payments.expiresMinutes * 60000).toISOString(),
      };
      this.repo.payments.set(id, payment);
      return payment;
    });
  }
  verifyPayment(owner: string, id: string) {
    const payment = this.owned(this.repo.payments, id, owner);
    if (payment.status === 'pending') {
      const result = this.provider.verify(payment.providerSessionId);
      payment.status =
        result === 'pending' && Date.parse(payment.expiresAt) <= this.now() ? 'expired' : result;
      if (payment.status !== 'pending') payment.verifiedAt = new Date(this.now()).toISOString();
      if (payment.status === 'succeeded') {
        payment.receipt = {
          id: randomUUID(),
          paymentId: id,
          total: payment.total,
          paidAt: payment.verifiedAt!,
          simulated: workflows.mode === 'demo',
        };
        this.notify(owner, id, 'payment-receipt');
      }
    }
    return structuredClone(payment);
  }
  listPayments(owner: string) {
    return [...this.repo.payments.values()]
      .filter((p) => p.ownerId === owner)
      .map((p) => this.verifyPayment(owner, p.id));
  }
  simulatePayment(owner: string, id: string, outcome: PaymentStatus) {
    const p = this.verifyPayment(owner, id);
    if (p.status !== 'pending') return fail(409, 'Payment is already settled or expired');
    if (!(this.provider instanceof DemoPaymentProvider) || workflows.mode !== 'demo')
      return fail(404, 'Simulation disabled');
    this.provider.simulate(p.providerSessionId, outcome);
    return this.verifyPayment(owner, id);
  }
}
