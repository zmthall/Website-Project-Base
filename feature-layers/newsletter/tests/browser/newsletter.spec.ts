import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('newsletter preview, issue links, dismissal and mobile layout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  const carousel = page.getByRole('region', { name: 'Inside the latest newsletter' });
  await expect(
    carousel.getByRole('heading', { name: 'Small details. Lasting impressions.' }),
  ).toBeVisible();
  await carousel.getByRole('button', { name: 'Next slide' }).click();
  await expect(
    carousel.getByRole('heading', { name: 'Meet the people behind the work.' }),
  ).toBeVisible();
  await carousel.getByRole('button', { name: 'Previous slide' }).click();
  await expect(
    carousel.getByRole('heading', { name: 'Small details. Lasting impressions.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss newsletter announcement' }).click();
  await expect(page.getByRole('complementary', { name: 'Latest newsletter' })).toHaveCount(0);
  await carousel.getByRole('link', { name: 'Read Small details. Lasting impressions.' }).click();
  await expect(page).toHaveURL(/\/newsletter#small-details$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notes from our corner.');
  await expect(page.getByRole('complementary', { name: 'Latest newsletter' })).toHaveCount(0);
  expect(
    (await new AxeBuilder({ page }).exclude('nuxt-devtools-frame').analyze()).violations,
  ).toEqual([]);
  await page.goto('/');
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(carousel).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});
