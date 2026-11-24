import test from 'node:test';
import assert from 'node:assert/strict';
import { isFeatureEnabled, isFeaturePathEnabled } from '../shared/utils/features';

test('feature routes are disabled by default including nested routes', () => {
  assert.equal(isFeaturePathEnabled(undefined, '/events'), false);
  assert.equal(isFeaturePathEnabled({ events: false }, '/events/example?view=full'), false);
  assert.equal(isFeaturePathEnabled({ events: true }, '/events/example'), true);
  assert.equal(isFeaturePathEnabled({}, '/events-other'), true);
  assert.equal(isFeaturePathEnabled({}, '/about'), true);
  assert.equal(isFeaturePathEnabled({}, '/careers'), false);
  assert.equal(isFeaturePathEnabled({ estimates: false }, '/estimates'), false);
  assert.equal(isFeaturePathEnabled({ estimates: true }, '/estimates'), true);
  assert.equal(isFeaturePathEnabled({ appointments: false }, '/appointments'), false);
  assert.equal(isFeaturePathEnabled({ appointments: true }, '/appointments'), true);
  assert.equal(isFeaturePathEnabled({ contact: true }, '/contact'), true);
  assert.equal(isFeatureEnabled({}, 'newsletter'), false);
  assert.equal(isFeaturePathEnabled({ reviews: false }, '/reviews'), false);
  assert.equal(isFeaturePathEnabled({ reviews: true }, '/reviews'), true);
  assert.equal(isFeaturePathEnabled({ newsletter: false }, '/newsletter'), false);
  assert.equal(isFeaturePathEnabled({ newsletter: true }, '/newsletter'), true);
  assert.equal(isFeaturePathEnabled({ products: false }, '/products'), false);
  assert.equal(isFeaturePathEnabled({ products: true }, '/products/example'), true);
});
