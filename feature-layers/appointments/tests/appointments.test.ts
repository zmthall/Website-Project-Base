import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryWorkflowRepository } from '../../../server/repositories/workflows';
import { zonedInstant } from '../../../shared/utils/scheduling';
import { AppointmentService } from '../server/services/appointments';
import type { AppointmentRequest } from '../app/features/appointments/types';

const start = Date.parse('2026-11-16T12:00:00Z');
const query = { date: '2026-11-17', service: 'consultation', location: 'remote', provider: 'team' };
const booking: AppointmentRequest = {
  ...query,
  time: '09:00',
  meeting: 'video',
  contact: { name: 'Example', email: 'example@example.com' },
  consent: true,
};
const setup = () => {
  const repo = createMemoryWorkflowRepository();
  return { repo, service: new AppointmentService(repo, () => start) };
};

test('availability respects timezone, DST, working days, duration, horizon and overlaps', () => {
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
      .some((slot) => slot.startsAt === '2026-11-17T16:30:00.000Z'),
  );
  assert.ok(service.availability(query).length < before.length);
});

test('simultaneous claims allow one booking and retries are idempotent', async () => {
  const { service } = setup();
  const results = await Promise.allSettled(
    ['a', 'b'].map((owner) => Promise.resolve().then(() => service.book(owner, booking, 'booking-key'))),
  );
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  const appointment = service.list('a')[0]!;
  assert.equal(service.book('a', booking, 'booking-key').id, appointment.id);
  assert.throws(
    () => service.book('a', { ...booking, notes: 'changed' }, 'booking-key'),
    /different input/,
  );
  assert.throws(() => service.book('b', booking, 'other-key'), /unavailable/);
});

test('reschedule is versioned and owned; cancellation releases slots and reminders', () => {
  const { repo, service } = setup();
  const appointment = service.book('a', booking, 'booking-key');
  const other = service.book('b', { ...booking, time: '11:00' }, 'booking-key');
  assert.throws(
    () => service.change('b', appointment.id, { version: appointment.version, cancel: true }, 'cancel-key'),
    /not found/,
  );
  assert.throws(
    () =>
      service.change(
        'a',
        appointment.id,
        { version: appointment.version, date: query.date, time: '11:00' },
        'resched-key',
      ),
    /unavailable/,
  );
  assert.equal(service.list('a')[0]!.startsAt, appointment.startsAt);
  const moved = service.change(
    'a',
    appointment.id,
    { version: appointment.version, date: query.date, time: '13:00' },
    'resched-key',
  );
  assert.equal(moved.version, 2);
  assert.throws(
    () => service.change('a', appointment.id, { version: 1, cancel: true }, 'cancel-key'),
    /changed/,
  );
  const canceled = service.change(
    'a',
    appointment.id,
    { version: 2, cancel: true },
    'cancel-key',
  );
  assert.equal(canceled.status, 'canceled');
  assert.ok(
    [...repo.notifications.values()]
      .filter((job) => job.resourceId === appointment.id && job.kind === 'appointment-reminder')
      .every((job) => job.status === 'canceled'),
  );
  assert.equal(service.book('c', { ...booking, time: '13:00' }, 'booking-key').status, 'confirmed');
  assert.equal(service.list('b')[0]!.id, other.id);
});
