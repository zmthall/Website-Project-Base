import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminAuthStore } from '..';
import type { AdminAuthAdapter, AdminSession } from '..';
import { isFeatureEnabled, isFeaturePathEnabled } from '../../../shared/utils/features';
const now = Date.parse('2026-01-01T00:00:00Z');
const session = (): AdminSession => ({
  provider: 'local',
  expiresAt: new Date(now + 3600000).toISOString(),
  idleExpiresAt: new Date(now + 600000).toISOString(),
  account: {
    id: 'admin-1',
    displayName: 'Example Admin',
    email: 'admin@example.com',
    emailVerified: true,
    roles: ['admin'],
    permissions: ['auth:configure'],
    createdAt: '2025-01-01T00:00:00Z',
    lastLoginAt: '2026-01-01T00:00:00Z',
    previousLoginAt: '2025-12-31T00:00:00Z',
  },
});
function adapter(overrides: Partial<AdminAuthAdapter> = {}): AdminAuthAdapter {
  return {
    session: async () => ({ session: null, csrfToken: 'csrf' }),
    login: async () => ({ session: session(), csrfToken: 'new-csrf' }),
    logout: async () => {},
    resetPassword: async () => {},
    getSettings: async () => {
      throw Error('not connected');
    },
    saveSettings: async () => {},
    ...overrides,
  };
}
test('provider choices control administrator availability', () => {
  for (const administrator of ['firebase', 'supabase', 'local'] as const)
    assert.equal(isFeatureEnabled({ administrator }, 'administrator'), true);
  assert.equal(isFeaturePathEnabled({ administrator: false }, '/admin/login'), false);
});
test('login bootstraps CSRF and shares profile, logout clears state', async () => {
  let received = '';
  const store = createAdminAuthStore(
    adapter({
      login: async (_email, _password, csrf) => {
        received = csrf;
        return { session: session(), csrfToken: 'new-csrf' };
      },
    }),
    () => now,
  );
  assert.equal(await store.login('admin@example.com', 'not-persisted'), true);
  assert.equal(received, 'csrf');
  assert.equal(store.account.value?.previousLoginAt, '2025-12-31T00:00:00Z');
  await store.logout();
  assert.equal(store.account.value, null);
});
test('non-admin and expired responses never grant frontend admin access', async () => {
  for (const value of [
    { ...session(), account: { ...session().account, roles: ['customer'] } },
    { ...session(), expiresAt: new Date(now - 1).toISOString() },
  ]) {
    const store = createAdminAuthStore(
      adapter({ session: async () => ({ session: value, csrfToken: 'csrf' }) }),
      () => now,
    );
    assert.equal(await store.restore(), false);
    assert.equal(store.isAuthenticated.value, false);
  }
});
test('idle expiry clears account and separate store instances do not share identity', async () => {
  let time = now;
  const first = createAdminAuthStore(adapter(), () => time);
  const second = createAdminAuthStore(adapter(), () => time);
  await first.login('admin@example.com', 'password');
  assert.equal(second.account.value, null);
  time += 600001;
  first.checkExpiry();
  assert.equal(first.account.value, null);
});
test('backend failures fail closed and logout failure is disclosed', async () => {
  const missing = createAdminAuthStore(
    adapter({
      session: async () => {
        throw Error('offline');
      },
    }),
    () => now,
  );
  assert.equal(await missing.login('admin@example.com', 'password'), false);
  assert.equal(missing.status.value, 'unavailable');
  const store = createAdminAuthStore(
    adapter({
      logout: async () => {
        throw Error('offline');
      },
    }),
    () => now,
  );
  await store.login('admin@example.com', 'password');
  assert.equal(await store.logout(), false);
  assert.equal(store.account.value, null);
  assert.match(store.error.value, /could not confirm sign-out/);
});
