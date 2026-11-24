import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryWorkflowRepository } from '../server/repositories/workflows';
import { WorkflowService } from '../server/services/workflows';
import type {
  EstimateRequest,
  PaymentProvider,
} from '../shared/types/workflows';
const start = Date.parse('2026-11-16T12:00:00Z');
const request: EstimateRequest = {
  service: 'new-project',
  description: 'A useful project with clear requirements.',
  budget: 'exploring',
  timeline: 'flexible',
  contact: { name: 'Example', email: 'example@example.com' },
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
