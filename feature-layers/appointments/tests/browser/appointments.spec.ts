import { test, expect, request as createRequest } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { site } from '../../../../shared/data/site';
import { zonedDate } from '../../../../shared/utils/scheduling';
import { appointmentWorkflow } from '../../shared/appointments';
test('availability, booking, conflict, rescheduling, cancellation and access control', async ({
  page,
}) => {
  test.skip(
    !site.features.appointments || site.features.customer !== 'local',
    'Local workflows disabled',
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const session = await (await page.request.get('/api/customer/auth/session')).json();
  const registered = await page.request.post('/api/customer/auth/register', {
    headers: { 'X-CSRF-Token': session.csrfToken },
    data: { email: `booking-${Date.now()}@example.com`, password: 'local-test-password-123' },
  });
  expect(registered.ok()).toBe(true);
  const auth = await registered.json();
  const headers = { 'X-CSRF-Token': auth.csrfToken, 'Idempotency-Key': crypto.randomUUID() };
  const d = new Date(zonedDate(Date.now(), appointmentWorkflow.timeZone) + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 2);
  while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  const date = d.toISOString().slice(0, 10);
  await page.goto('/appointments');
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt') as
      | (Element & {
          __vue_app__?: { config: { globalProperties: { $nuxt?: { isHydrating: boolean } } } };
        })
      | null;
    return root?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false;
  });
  if (await page.getByRole('button', { name: 'Essential only' }).isVisible())
    await page.getByRole('button', { name: 'Essential only' }).click();
  await page.getByLabel(/^Preferred date\*?$/).fill(date);
  const times = page.getByLabel(/^Available time\*?$/);
  await expect.poll(() => times.locator('option:not([disabled])').count()).toBeGreaterThan(1);
  await times.selectOption({ index: 1 });
  await page.getByLabel(/^Full name\*?$/).fill('Example');
  await page.getByLabel(/^Email address\*?$/).fill('example@example.com');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Confirm demo appointment' }).click();
  await expect(page.getByRole('heading', { name: 'Demo appointment confirmed' })).toBeVisible();
  const list = await (await page.request.get('/api/workflows/appointments')).json();
  const booking = list[0];
  expect(booking.status).toBe('confirmed');
  expect(
    (
      await page.request.post(`/api/workflows/appointments/${booking.id}/cancel`, {
        data: { version: 1 },
      })
    ).status(),
  ).toBe(403);
  const other = await createRequest.newContext({ baseURL: 'http://127.0.0.1:43188' });
  expect((await other.get('/api/workflows/appointments')).status()).toBe(401);
  await other.dispose();
  const opts = { date, service: 'introduction', location: 'remote', provider: 'team' };
  const available = await (
    await page.request.get('/api/workflows/appointments/availability', { params: opts })
  ).json();
  const slot = available[0];
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: booking.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(slot.startsAt));
  const changed = await page.request.post(`/api/workflows/appointments/${booking.id}/reschedule`, {
    headers,
    data: { version: 1, date, time },
  });
  expect(changed.ok()).toBe(true);
  const updated = await changed.json();
  expect(updated.version).toBe(2);
  const cancel = await page.request.post(`/api/workflows/appointments/${booking.id}/cancel`, {
    headers: { ...headers, 'Idempotency-Key': crypto.randomUUID() },
    data: { version: 2 },
  });
  expect(cancel.ok()).toBe(true);
  expect((await cancel.json()).status).toBe('canceled');
  await page.goto('/customer/workflows');
  await expect(page.getByText(/· canceled/)).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .exclude('nuxt-devtools-frame')
        .exclude('devframes-onboard')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
