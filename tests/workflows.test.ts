import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryWorkflowRepository } from '../server/repositories/workflows';
import { WorkflowService } from '../server/services/workflows';
import { zonedInstant } from '../shared/utils/scheduling';
import type {
  AppointmentRequest,
  EstimateRequest,
  PaymentProvider,
} from '../shared/types/workflows';
const start = Date.parse('2026-11-16T12:00:00Z');
const query = { date: '2026-11-17', service: 'consultation', location: 'remote', provider: 'team' };
const booking: AppointmentRequest = {
  ...query,
  time: '09:00',
  meeting: 'video',
  contact: { name: 'Example', email: 'example@example.com' },
  consent: true,
};
const request: EstimateRequest = {
  service: 'new-project',
  description: 'A useful project with clear requirements.',
  budget: 'exploring',
  timeline: 'flexible',
  contact: booking.contact,
  consent: true,
};
const setup = () => {
  let clock = start;
  const repo = createMemoryWorkflowRepository();
  const service = new WorkflowService(repo, () => clock);
  return {
    repo,
    service,
    tick: (value: number) => {
      clock = value;
    },
  };
};
test('availability respects timezone, DST, working days, duration, horizon and overlapping provider bookings', () => {
  const { service } = setup();
  assert.equal(zonedInstant('2026-03-08', '02:30', 'America/Denver'), undefined);
  assert.equal(zonedInstant('2026-11-17', '09:00', 'America/Denver'), '2026-11-17T16:00:00.000Z');
  assert.equal(zonedInstant('2026-02-30', '09:00', 'America/Denver'), undefined);
  assert.equal(service.availability({ ...query, date: '2026-11-21' }).length, 0);
  assert.throws(() => service.availability({ ...query, date: '2099-01-01' }));
  assert.throws(() => service.availability({ ...query, provider: 'someone-else' }));
  const before = service.availability(query);
  assert.ok(before.length > 0);
  service.book('a', booking, 'booking-key');
  assert.ok(
    !service
      .availability({ ...query, service: 'introduction' })
      .some((s) => s.startsAt === '2026-11-17T16:30:00.000Z'),
  );
  assert.ok(service.availability(query).length < before.length);
});
test('simultaneous claims allow one booking and retries are idempotent', async () => {
  const { service } = setup();
  const results = await Promise.allSettled(
    ['a', 'b'].map((owner) =>
      Promise.resolve().then(() => service.book(owner, booking, 'booking-key')),
    ),
  );
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  const a = service.listAppointments('a')[0]!;
  assert.equal(service.book('a', booking, 'booking-key').id, a.id);
  assert.throws(
    () => service.book('a', { ...booking, notes: 'changed' }, 'booking-key'),
    /different input/,
  );
  assert.throws(() => service.book('b', booking, 'other-key'), /unavailable/);
});
test('reschedule is atomic, versioned and owned; cancellation releases the slot and cancels reminders', () => {
  const { repo, service } = setup();
  const a = service.book('a', booking, 'booking-key');
  const b = service.book('b', { ...booking, time: '11:00' }, 'booking-key');
  assert.throws(
    () => service.changeAppointment('b', a.id, { version: a.version, cancel: true }, 'cancel-key'),
    /not found/,
  );
  assert.throws(
    () =>
      service.changeAppointment(
        'a',
        a.id,
        { version: a.version, date: query.date, time: '11:00' },
        'resched-key',
      ),
    /unavailable/,
  );
  assert.equal(service.listAppointments('a')[0]!.startsAt, a.startsAt);
  const moved = service.changeAppointment(
    'a',
    a.id,
    { version: a.version, date: query.date, time: '13:00' },
    'resched-key',
  );
  assert.equal(moved.version, 2);
  assert.throws(
    () => service.changeAppointment('a', a.id, { version: 1, cancel: true }, 'cancel-key'),
    /changed/,
  );
  const canceled = service.changeAppointment('a', a.id, { version: 2, cancel: true }, 'cancel-key');
  assert.equal(canceled.status, 'canceled');
  assert.ok(
    [...repo.notifications.values()]
      .filter((j) => j.resourceId === a.id && j.kind === 'appointment-reminder')
      .every((j) => j.status === 'canceled'),
  );
  assert.equal(service.book('c', { ...booking, time: '13:00' }, 'booking-key').status, 'confirmed');
  assert.equal(service.listAppointments('b')[0]!.id, b.id);
});
test('estimate ownership, authoritative totals, lifecycle, expiry and decision idempotency', () => {
  const { service, tick } = setup();
  const e = service.requestEstimate('a', request, 'request-key');
  assert.equal(service.requestEstimate('a', request, 'request-key').id, e.id);
  assert.throws(() => service.getEstimate('b', e.id), /not found/);
  const q = service.quote(e.id, {
    version: 1,
    items: [{ description: 'Work', quantity: 2, unitAmount: 2500 }],
    depositAmount: 1000,
    expiresAt: '2026-12-01T00:00:00Z',
  });
  assert.equal(q.total.amount, 5000);
  assert.equal(q.status, 'sent');
  const accepted = service.decide('a', q.id, 'accepted', q.version, 'decision-key');
  assert.equal(accepted.status, 'accepted');
  assert.equal(service.decide('a', q.id, 'accepted', q.version, 'decision-key').status, 'accepted');
  assert.throws(
    () => service.decide('b', q.id, 'accepted', q.version, 'decision-key'),
    /not found/,
  );
  assert.throws(
    () => service.decide('a', q.id, 'declined', accepted.version, 'decline-key'),
    /already decided/,
  );
  const second = service.requestEstimate('a', request, 'request-key2');
  service.quote(second.id, {
    version: 1,
    items: [{ description: 'Work', quantity: 1, unitAmount: 500 }],
    depositAmount: 0,
    expiresAt: '2026-11-17T00:00:00Z',
  });
  tick(Date.parse('2026-11-18T00:00:00Z'));
  assert.equal(service.getEstimate('a', second.id).status, 'expired');
  assert.throws(() => service.decide('a', second.id, 'accepted', 2, 'decision-key'), /expired/);
});
test('upload integration requires an enabled owner-verifying adapter', () => {
  const { service } = setup();
  assert.throws(
    () => service.requestEstimate('a', { ...request, uploadIds: ['file'] }, 'request-key', true),
    /not configured/,
  );
  const uploads = {
    resolve: (owner: string, ids: string[]) => {
      if (owner !== 'a' || ids[0] !== 'file') throw Error('Not owned');
      return [{ id: 'file', name: 'photo.png', size: 10, mimeType: 'image/png' }];
    },
  };
  const adapted = new WorkflowService(
    createMemoryWorkflowRepository(),
    () => start,
    undefined,
    uploads,
  );
  assert.equal(
    adapted.requestEstimate('a', { ...request, uploadIds: ['file'] }, 'request-key', true)
      .attachments.length,
    1,
  );
  assert.throws(
    () => adapted.requestEstimate('b', { ...request, uploadIds: ['file'] }, 'request-key', true),
    /Not owned/,
  );
});
test('payments use server amounts, preserve pending, verify receipts, gate ownership and reject duplicate deposits', () => {
  const { service } = setup();
  const e = service.requestEstimate('a', request, 'request-key');
  const q = service.quote(e.id, {
    version: 1,
    items: [{ description: 'Work', quantity: 1, unitAmount: 10000 }],
    depositAmount: 2500,
    expiresAt: '2026-12-01T00:00:00Z',
  });
  service.decide('a', e.id, 'accepted', q.version, 'decision-key');
  const purpose = { type: 'estimate-deposit' as const, estimateId: e.id };
  const p = service.createPayment('a', purpose, 'payment-key');
  assert.equal(p.total.amount, 2500);
  assert.equal(service.createPayment('a', purpose, 'payment-key').id, p.id);
  assert.equal(service.createPayment('a', purpose, 'payment-key2').id, p.id);
  assert.throws(() => service.verifyPayment('b', p.id), /not found/);
  assert.equal(service.verifyPayment('a', p.id).status, 'pending');
  const paid = service.simulatePayment('a', p.id, 'succeeded');
  assert.equal(paid.receipt?.simulated, true);
  assert.ok(paid.verifiedAt);
  assert.equal(service.verifyPayment('a', p.id).receipt?.id, paid.receipt?.id);
  assert.throws(() => service.createPayment('a', purpose, 'payment-key3'), /already paid/);
  assert.throws(() => service.simulatePayment('a', p.id, 'failed'), /settled/);
});
test('payment decline, cancel, failure, timeout and provider failure never create paid receipts', () => {
  for (const outcome of ['declined', 'canceled', 'failed'] as const) {
    const { service } = setup();
    const p = service.createPayment(
      'a',
      { type: 'one-time', productId: 'consultation' },
      'payment-key',
    );
    assert.equal(service.simulatePayment('a', p.id, outcome).receipt, undefined);
    assert.equal(service.verifyPayment('a', p.id).status, outcome);
  }
  const { service, tick } = setup();
  const p = service.createPayment(
    'a',
    { type: 'one-time', productId: 'consultation' },
    'payment-key',
  );
  tick(start + 3600000);
  assert.equal(service.verifyPayment('a', p.id).status, 'expired');
  assert.throws(() => service.simulatePayment('a', p.id, 'succeeded'), /expired/);
  const failing: PaymentProvider = {
    create: () => {
      throw Error('Provider unavailable');
    },
    verify: () => 'failed',
  };
  const bad = new WorkflowService(createMemoryWorkflowRepository(), () => start, failing);
  assert.throws(
    () => bad.createPayment('a', { type: 'one-time', productId: 'consultation' }, 'payment-key'),
    /unavailable/,
  );
  assert.equal(bad.repo.payments.size, 0);
});
