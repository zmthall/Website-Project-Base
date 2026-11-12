import { site } from '../../shared/data/site';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('event calendar navigation, filtering, details and mobile layout', async ({ page }) => {
  test.skip(!site.features.events, 'Events are disabled in the current site configuration.');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/events');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Something to look forward to.');
  const event = page.getByRole('button', { name: /Community coffee morning,/ });
  await event.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('America/Denver');
  await page.keyboard.press('Escape');
  await expect(event).toBeFocused();
  await page.getByLabel('Category', { exact: true }).selectOption('Workshop');
  await expect(page.locator('.calendar-event')).toHaveCount(1);
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(page.locator('.calendar-event')).toHaveCount(1);
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(page.getByText('No events this month')).toBeVisible();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.getByLabel('Category', { exact: true }).selectOption('All events');
  expect(
    (await new AxeBuilder({ page }).exclude('nuxt-devtools-frame').analyze()).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.calendar-month')).toBeHidden();
  await page.locator('.calendar-agenda-item').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('disabled features are unavailable in routes and navigation', async ({ page }) => {
  const response = await page.goto('/careers');
  expect(response?.status()).toBe(site.features.careers ? 200 : 404);
  await page.goto('/');
  if (!site.features.careers)
    await expect(page.getByRole('link', { name: 'Careers', exact: true })).toHaveCount(0);
  if (site.features.events)
    await expect(page.getByRole('link', { name: 'Events', exact: true }).first()).toBeVisible();
  else await expect(page.getByRole('link', { name: 'Events', exact: true })).toHaveCount(0);
});
