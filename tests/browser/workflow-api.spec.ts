// TODO [OPS-02]: Run mandatory authenticated workflows in CI with isolated seeded accounts and test signed webhooks, cross-account access, distributed conflicts, backup restore and restart recovery. See docs/integration-audit.md.
import { test, expect, request as requests } from '@playwright/test';
import { site } from '../../shared/data/site';
test('estimate API isolates customers, enforces admin CSRF and accepts authoritative quotes', async () => {
  test.skip(
    !site.features.estimates || !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    'Test admin credentials and local estimates required',
  );
  const contexts = await Promise.all(
    [0, 1, 2].map(() => requests.newContext({ baseURL: 'http://127.0.0.1:43188' })),
  );
  const [a, b, admin] = contexts;
  try {
    async function register(client: typeof a) {
      const s = await (await client!.get('/api/customer/auth/session')).json();
      const r = await client!.post('/api/customer/auth/register', {
        headers: { 'X-CSRF-Token': s.csrfToken },
        data: {
          email: `workflow-${crypto.randomUUID()}@example.com`,
          password: 'local-test-password-123',
        },
      });
      expect(r.ok()).toBe(true);
      return (await r.json()).csrfToken as string;
    }
    const csrf = await register(a);
    await register(b);
    const body = {
      service: 'new-project',
      description: 'A project with useful requirements and a clear scope.',
      budget: 'exploring',
      timeline: 'flexible',
      contact: { name: 'Example', email: 'example@example.com' },
      consent: true,
    };
    expect((await a!.post('/api/workflows/estimates', { data: body })).status()).toBe(403);
    const headers = { 'X-CSRF-Token': csrf, 'Idempotency-Key': crypto.randomUUID() };
    const created = await a!.post('/api/workflows/estimates', { headers, data: body });
    expect(created.ok()).toBe(true);
    const estimate = await created.json();
    const retry = await a!.post('/api/workflows/estimates', { headers, data: body });
    expect((await retry.json()).id).toBe(estimate.id);
    expect((await b!.get('/api/workflows/estimates/' + estimate.id)).status()).toBe(404);
    expect((await a!.get('/api/workflows/estimates/admin')).status()).toBe(401);
    const s = await (await admin!.get('/api/admin/auth/session')).json();
    const login = await admin!.post('/api/admin/auth/login', {
      headers: { 'X-CSRF-Token': s.csrfToken },
      data: { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD },
    });
    expect(login.ok()).toBe(true);
    const adminAuth = await login.json();
    const quote = {
      version: 1,
      items: [{ description: 'Scope of work', quantity: 2, unitAmount: 12500 }],
      depositAmount: 5000,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
    expect(
      (await admin!.put('/api/workflows/estimates/admin/' + estimate.id, { data: quote })).status(),
    ).toBe(403);
    const sent = await admin!.put('/api/workflows/estimates/admin/' + estimate.id, {
      headers: { 'X-CSRF-Token': adminAuth.csrfToken },
      data: quote,
    });
    expect(sent.ok()).toBe(true);
    const quoted = await sent.json();
    expect(quoted.total.amount).toBe(25000);
    const decision = await a!.post(`/api/workflows/estimates/${estimate.id}/decision`, {
      headers: { ...headers, 'Idempotency-Key': crypto.randomUUID() },
      data: { version: quoted.version, decision: 'accepted' },
    });
    expect(decision.ok()).toBe(true);
    expect((await decision.json()).status).toBe('accepted');
    if (!site.features.payments)
      expect((await a!.get('/api/workflows/payments')).status()).toBe(404);
  } finally {
    await Promise.all(contexts.map((c) => c.dispose()));
  }
});
