import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { site } from '../../../../shared/data/site';

test('reviews filter, sort, and demonstrate submission without publishing', async ({ page }) => {
  test.skip(!site.features.reviews, 'Reviews disabled in site configuration.');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/reviews');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  await expect(page.locator('.review-card')).toHaveCount(6);
  await page.getByLabel('Filter by rating').selectOption('5');
  await expect(page.locator('.review-card')).toHaveCount(3);
  await page.getByLabel('Filter by rating').selectOption('1');
  await expect(page.getByText('No reviews with this rating')).toBeVisible();
  await page.getByRole('button', { name: 'Show all reviews' }).click();
  await page.getByLabel('Sort reviews').selectOption('lowest');
  await expect(page.locator('.review-card').first()).toContainText('Casey L.');
  await page.getByRole('button', { name: 'Write a review' }).click();
  await page.getByLabel('Your name', { exact: true }).fill('Example reader');
  await page
    .getByLabel('Your review', { exact: true })
    .fill('An illustrative review for the demo.');
  await page.getByRole('button', { name: 'Submit review' }).click();
  await expect(page.getByRole('dialog')).toContainText('Your review is awaiting moderation.');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Write a review' })).toBeFocused();
  await expect(page.locator('.review-card')).toHaveCount(6);
  expect(
    (await new AxeBuilder({ page }).exclude('nuxt-devtools-frame').analyze()).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});
