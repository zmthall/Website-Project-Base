import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('contact form validates and submits an accessible inquiry', async ({ page }) => {
  const mutations: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') mutations.push(request.url());
  });
  await page.goto('/contact');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  const submit = page.getByRole('button', { name: 'Send message', exact: true });
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Please check');
  await page.getByLabel('Full name', { exact: false }).fill('Example Person');
  await page.getByLabel('Email address', { exact: false }).fill('example@example.com');
  await page.getByLabel('How can we help?', { exact: false }).selectOption('general');
  await page
    .getByLabel('Your message', { exact: false })
    .fill('This is an illustrative contact message.');
  await page.getByRole('checkbox').check();
  await submit.click();
  await expect(page.getByRole('dialog')).toContainText('Message received');
  await page.keyboard.press('Escape');
  await expect(submit).toBeFocused();
  expect(mutations.some((url) => url.endsWith('/api/contact'))).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .exclude('nuxt-devtools-frame')
        .exclude('devframes-onboard')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
