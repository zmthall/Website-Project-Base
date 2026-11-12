import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { site } from '../../shared/data/site';
test('estimate requests save privately and validate before submission', async ({ page }) => {
  test.skip(
    !site.features.estimates || site.features.customer !== 'local',
    'Local workflows disabled',
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const session = await (await page.request.get('/api/customer/auth/session')).json();
  const registered = await page.request.post('/api/customer/auth/register', {
    headers: { 'X-CSRF-Token': session.csrfToken },
    data: { email: `estimate-${Date.now()}@example.com`, password: 'local-test-password-123' },
  });
  expect(registered.ok()).toBe(true);
  await page.goto('/estimates');
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
  const submit = page.getByRole('button', { name: 'Send demo estimate request', exact: true });
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Please check');
  await page.getByLabel('Project type', { exact: false }).selectOption('new-project');
  await page
    .getByLabel('Project details', { exact: false })
    .fill('A useful example project with a clear goal.');
  await page.getByLabel('Budget preference', { exact: false }).selectOption('exploring');
  await page.getByLabel('Preferred timeline', { exact: false }).selectOption('flexible');
  await page.getByLabel('Full name', { exact: false }).fill('Example');
  await page.getByLabel('Email address', { exact: false }).fill('example@example.com');
  await page.getByRole('checkbox').check();
  await submit.click();
  await expect(page.getByRole('dialog')).toContainText('Saved in server memory');
  await page.keyboard.press('Escape');
  expect(
    (await new AxeBuilder({ page }).exclude('nuxt-devtools-frame').analyze()).violations,
  ).toEqual([]);
  await page.goto('/customer/workflows');
  await expect(page.getByText('A useful example project with a clear goal.')).toBeVisible();
  expect(errors).toEqual([]);
});
