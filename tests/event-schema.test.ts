import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedEventSchemas } from '../app/features/events/schema';
import type { ManagedRecord } from '../shared/types/management';
const record: ManagedRecord = {
  id: 'real-event',
  version: '1',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  fields: {
    status: 'published',
    title: 'Community gathering',
    description: 'A real event',
    date: '2026-11-17',
    startTime: '10:00',
    endTime: '11:00',
    timeZone: 'America/Denver',
    location: 'Meeting room',
    street: '123 Main',
    city: 'Denver',
    countryCode: 'US',
  },
};
test('only published events with complete location/date data produce timezone-correct schema', () => {
  const schemas = publishedEventSchemas([record]);
  assert.equal(schemas.length, 1);
  const event = schemas[0];
  assert.equal(event?.kind, 'event');
  if (event?.kind === 'event') {
    assert.equal(event.startDate, '2026-11-17T17:00:00.000Z');
    assert.equal(event.id, record.id);
  }
  assert.deepEqual(
    publishedEventSchemas([{ ...record, fields: { ...record.fields, status: 'draft' } }]),
    [],
  );
  assert.deepEqual(
    publishedEventSchemas([{ ...record, fields: { ...record.fields, street: '', onlineUrl: '' } }]),
    [],
  );
  assert.deepEqual(
    publishedEventSchemas([{ ...record, fields: { ...record.fields, timeZone: 'invalid' } }]),
    [],
  );
  assert.deepEqual(publishedEventSchemas([]), []);
});
