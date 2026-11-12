// TODO [PAY-01]: Implement Square/Stripe hosted checkout using private runtime keys, server-owned amounts and stable provider idempotency; keep demo outcomes separate from real payment state. See docs/integration-audit.md.
// TODO [EST-01]: Add audited multi-line revisions/requote/withdrawal policies, tax/discount/currency rules and durable acceptance evidence; preserve accepted versions when quoting changes. See docs/integration-audit.md.
// TODO [BOOK-01]: Add provider-specific schedules, holidays, duration/buffer and location capacity rules with transactional overlap constraints, timezone/DST tests and authoritative clock handling. See docs/integration-audit.md.
import { randomUUID, createHash } from 'node:crypto';
import { createError } from 'h3';
import { workflows } from '../../shared/data/workflows';
import { appointments as appointmentChoices } from '../../shared/data/appointments';
import { estimates as estimateChoices } from '../../shared/data/estimates';
import { zonedDate, zonedInstant } from '../../shared/utils/scheduling';
import type {
  AppointmentRequest,
  AvailabilityQuery,
  EstimateRequest,
  QuoteInput,
  PaymentPurpose,
  PaymentStatus,
  PaymentProvider,
  UploadResolver,
  WorkflowRepository,
  NotificationJob,
  Money,
} from '../../shared/types/workflows';
const fail = (statusCode: number, statusMessage: string): never => {
  throw createError({ statusCode, statusMessage });
};
const text = (value: unknown, max = 1000) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;
function contact(value: unknown) {
  const c = value as AppointmentRequest['contact'] | undefined;
  if (
    !c ||
    !text(c.name, 200) ||
    !text(c.email, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) ||
    (c.phone !== undefined && (typeof c.phone !== 'string' || c.phone.length > 100))
  )
    fail(400, 'Enter valid contact details');
}
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
export class WorkflowService {
  constructor(
    public readonly repo: WorkflowRepository,
    private now = () => Date.now(),
    private provider: PaymentProvider = new DemoPaymentProvider(),
    private uploads?: UploadResolver,
  ) {}
  configureUploads(resolver: UploadResolver) {
    this.uploads = resolver;
  }
  get uploadsConfigured() {
    return Boolean(this.uploads);
  }
  private owned<T extends { ownerId: string }>(
    records: Map<string, T>,
    id: string,
    ownerId: string,
  ): T {
    const record = records.get(id);
    if (!record || record.ownerId !== ownerId) return fail(404, 'Record not found');
    return record;
  }
  private repeat<T>(
    owner: string,
    operation: string,
    key: string,
    input: unknown,
    run: () => T,
  ): T {
    if (!/^[\w-]{8,100}$/.test(key)) fail(400, 'A valid Idempotency-Key is required');
    const id = `${owner}:${operation}:${key}`;
    const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const previous = this.repo.attempts.get(id);
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        fail(409, 'Idempotency key reused with different input');
      return structuredClone(previous.result) as T;
    }
    if (this.repo.attempts.size >= 10000) fail(503, 'Demo repository is full; restart it');
    const result = run();
    this.repo.attempts.set(id, { fingerprint, result: structuredClone(result) });
    return structuredClone(result);
  }
  private notify(
    ownerId: string,
    resourceId: string,
    kind: NotificationJob['kind'],
    dueAt = new Date(this.now()).toISOString(),
  ) {
    const job: NotificationJob = {
      id: randomUUID(),
      ownerId,
      resourceId,
      kind,
      dueAt,
      status: 'queued',
    };
    this.repo.notifications.set(job.id, job);
  }
  private stopReminders(id: string) {
    for (const job of this.repo.notifications.values())
      if (job.resourceId === id && job.kind === 'appointment-reminder') job.status = 'canceled';
  }
  availability(query: AvailabilityQuery, ignoreId?: string) {
    const cfg = workflows.appointments;
    if (
      !query ||
      !text(query.date, 10) ||
      !text(query.service) ||
      !text(query.location) ||
      !text(query.provider)
    )
      fail(400, 'Select a date, service, location and provider');
    const duration = Object.hasOwn(cfg.serviceMinutes, query.service)
      ? cfg.serviceMinutes[query.service]
      : undefined;
    if (
      !duration ||
      !cfg.locations.some((l) => l.value === query.location) ||
      !cfg.providers.some((p) => p.value === query.provider && p.locations.includes(query.location))
    )
      return fail(400, 'Invalid scheduling options');
    const day = Date.parse(query.date + 'T00:00:00Z');
    if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== query.date)
      fail(400, 'Invalid date');
    const today = zonedDate(this.now(), cfg.timeZone);
    if (query.date < today || day > Date.parse(today + 'T00:00:00Z') + cfg.horizonDays * 86400000)
      fail(400, 'Choose a date inside the booking window');
    if (!cfg.weekdays.includes(new Date(day).getUTCDay()) || cfg.closedDates.includes(query.date))
      return [];
    const minute = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
    const slots = [];
    for (
      let value = minute(cfg.opens);
      value + duration <= minute(cfg.closes);
      value += cfg.intervalMinutes
    ) {
      const time = `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
      const startsAt = zonedInstant(query.date, time, cfg.timeZone);
      if (!startsAt) continue;
      const end = Date.parse(startsAt) + duration * 60000;
      if (Date.parse(startsAt) < this.now() + cfg.leadMinutes * 60000) continue;
      const conflict = [...this.repo.appointments.values()].some(
        (a) =>
          a.id !== ignoreId &&
          a.status === 'confirmed' &&
          a.provider === query.provider &&
          Date.parse(a.startsAt) < end &&
          Date.parse(a.endsAt) > Date.parse(startsAt),
      );
      if (!conflict)
        slots.push({
          id: `${query.date}/${time}/${query.provider}/${query.location}/${query.service}`,
          service: query.service,
          location: query.location,
          provider: query.provider,
          startsAt,
          endsAt: new Date(end).toISOString(),
          timeZone: cfg.timeZone,
        });
    }
    return slots;
  }
  book(ownerId: string, input: AppointmentRequest, key: string) {
    return this.repeat(ownerId, 'book', key, input, () => {
      contact(input.contact);
      if (
        input.consent !== true ||
        !appointmentChoices.meetingTypes.some((m) => m.value === input.meeting) ||
        (input.meeting === 'phone' && !text(input.contact.phone)) ||
        (input.meeting === 'in-person' && input.location !== 'office') ||
        (input.meeting !== 'in-person' && input.location !== 'remote') ||
        (input.notes !== undefined &&
          (typeof input.notes !== 'string' || input.notes.length > 10000))
      )
        fail(400, 'Check meeting format, location, consent and notes');
      const startsAt = zonedInstant(input.date, input.time, workflows.appointments.timeZone);
      const slot = this.availability(input).find((s) => s.startsAt === startsAt);
      if (!slot)
        return fail(409, 'This time is unavailable. Refresh availability and choose another slot.');
      const record = {
        ...slot,
        id: randomUUID(),
        ownerId,
        contact: input.contact,
        meeting: input.meeting,
        notes: input.notes ?? '',
        status: 'confirmed' as const,
        version: 1,
      };
      this.repo.appointments.set(record.id, structuredClone(record));
      this.notify(ownerId, record.id, 'appointment-confirmed');
      this.notify(
        ownerId,
        record.id,
        'appointment-reminder',
        new Date(Math.max(this.now(), Date.parse(slot.startsAt) - 86400000)).toISOString(),
      );
      return record;
    });
  }
  listAppointments(owner: string) {
    return structuredClone([...this.repo.appointments.values()].filter((a) => a.ownerId === owner));
  }
  changeAppointment(
    owner: string,
    id: string,
    input: { version: number; cancel?: boolean; date?: string; time?: string },
    key: string,
  ) {
    return this.repeat(owner, `appointment:${id}`, key, input, () => {
      const current = this.owned(this.repo.appointments, id, owner);
      if (
        current.version !== input.version ||
        current.status !== 'confirmed' ||
        Date.parse(current.startsAt) <= this.now()
      )
        return fail(409, 'Appointment changed or can no longer be modified');
      if (input.cancel) {
        current.status = 'canceled';
        this.stopReminders(id);
        this.notify(owner, id, 'appointment-canceled');
      } else {
        const startsAt = zonedInstant(input.date ?? '', input.time ?? '', current.timeZone);
        const slot = this.availability(
          {
            date: input.date ?? '',
            service: current.service,
            location: current.location,
            provider: current.provider,
          },
          id,
        ).find((s) => s.startsAt === startsAt);
        if (!slot) return fail(409, 'This time is unavailable. Choose another slot.');
        Object.assign(current, slot, { id });
        this.stopReminders(id);
        this.notify(owner, id, 'appointment-rescheduled');
        this.notify(
          owner,
          id,
          'appointment-reminder',
          new Date(Math.max(this.now(), Date.parse(slot.startsAt) - 86400000)).toISOString(),
        );
      }
      current.version++;
      return structuredClone(current);
    });
  }
  requestEstimate(owner: string, input: EstimateRequest, key: string, allowUploads = false) {
    return this.repeat(owner, 'estimate-request', key, input, () => {
      contact(input.contact);
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
