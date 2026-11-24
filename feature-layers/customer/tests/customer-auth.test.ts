import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CustomerAccounts } from '../server/utils/customer-accounts';
import { createCustomerAuthStore } from '../app/features/customer/store';
import { sessionIsAdmin } from '../../administrator';
import type { CustomerAuthAdapter, CustomerSession } from '../app/features/customer/types';
import { isFeaturePathEnabled } from '../../../shared/utils/features';

test('local registration persists hashed credentials, rejects duplicates, and only authenticates the owner', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'customer-auth-'));
  const filename = join(directory, 'customers.sqlite');
  let database = new CustomerAccounts(filename);
  try {
    const account = await database.register('Customer@Example.com', 'strong-test-password');
    assert.deepEqual(account.roles, ['customer']);
    assert.equal(account.emailVerified, false);
    assert.equal(await database.login('customer@example.com', 'wrong-password'), null);
    assert.equal(await database.login('unknown@example.com', 'strong-test-password'), null);
    await assert.rejects(database.register('customer@example.com', 'different-password'));
    database.close();
    database = new CustomerAccounts(filename);
    assert.equal(
      (await database.login('CUSTOMER@example.com', 'strong-test-password'))?.id,
      account.id,
    );
    assert.equal(readFileSync(filename).includes(Buffer.from('strong-test-password')), false);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('customer store uses CSRF, separates identities, and supports sign-out and sign-in again', async () => {
  const now = Date.now();
  const session: CustomerSession = {
    provider: 'local',
    expiresAt: new Date(now + 3600000).toISOString(),
    idleExpiresAt: new Date(now + 1800000).toISOString(),
    account: {
      id: 'customer-1',
      email: 'customer@example.com',
      displayName: 'Customer',
      emailVerified: false,
      roles: ['customer'],
    },
  };
  let loggedIn = false;
  const adapter: CustomerAuthAdapter = {
    session: async () => ({
      provider: 'local',
      session: loggedIn ? session : null,
      csrfToken: 'csrf',
    }),
    login: async (_email, _password, csrf) => {
      assert.equal(csrf, 'csrf');
      loggedIn = true;
      return { provider: 'local', session, csrfToken: 'csrf' };
    },
    register: async (_email, _password, csrf) => {
      assert.equal(csrf, 'csrf');
      loggedIn = true;
      return { provider: 'local', session, csrfToken: 'csrf' };
    },
    logout: async (csrf) => {
      assert.equal(csrf, 'csrf');
      loggedIn = false;
    },
  };
  const store = createCustomerAuthStore(adapter, () => now);
  assert.equal(await store.register('customer@example.com', 'strong-test-password'), true);
  assert.equal(store.isAuthenticated.value, true);
  // Even with forged frontend profile shape, the customer role cannot pass the admin check.
  assert.equal(
    sessionIsAdmin(
      {
        ...session,
        account: {
          ...session.account,
          permissions: [],
          createdAt: '',
          lastLoginAt: null,
          previousLoginAt: null,
        },
      },
      now,
    ),
    false,
  );
  assert.equal(createCustomerAuthStore(adapter).account.value, null);
  await store.logout();
  assert.equal(store.account.value, null);
  assert.equal(await store.login('customer@example.com', 'strong-test-password'), true);
});

test('customer session expiry and role checks fail closed', async () => {
  const now = Date.now();
  for (const roles of [['admin'], ['customer']]) {
    const adapter: CustomerAuthAdapter = {
      session: async () => ({
        provider: 'local',
        csrfToken: 'csrf',
        session: {
          provider: 'local',
          expiresAt: new Date(now + 60000).toISOString(),
          idleExpiresAt: new Date(roles[0] === 'customer' ? now - 1 : now + 60000).toISOString(),
          account: {
            id: '1',
            email: 'test@example.com',
            displayName: 'Test',
            emailVerified: false,
            roles,
          },
        },
      }),
      login: async () => {
        throw Error('unused');
      },
      register: async () => {
        throw Error('unused');
      },
      logout: async () => {},
    };
    const store = createCustomerAuthStore(adapter, () => now);
    assert.equal(await store.restore(), false);
    assert.equal(store.isAuthenticated.value, false);
  }
  assert.equal(isFeaturePathEnabled({ customer: false }, '/customer/login'), false);
  assert.equal(isFeaturePathEnabled({ customer: 'local' }, '/customer/orders'), true);
});
