import { test, expect } from '@playwright/test';

test('site search supports prefix scopes and links only to public results', async ({
  page,
  request,
}) => {
  const response = await request.get('/api/search', { params: { q: '@service', pageSize: 50 } });
  expect(response.status()).toBe(200);
  const payload = (await response.json()) as {
    items: { path: string; scope: string }[];
    total: number;
  };
  expect(payload.total).toBeGreaterThan(0);
  expect(payload.items.every((item) => item.scope === 'page')).toBe(true);
  expect(payload.items.every((item) => !item.path.startsWith('/admin'))).toBe(true);
  expect(payload.items.every((item) => !item.path.startsWith('/customer'))).toBe(true);

  await page.goto('/search?q=%23article');
  await expect(page.getByRole('heading', { level: 1, name: 'Search the website' })).toBeVisible();
  await expect(page.getByText('@ pages', { exact: true })).toBeVisible();
  await expect(page.getByText('# blogs & news', { exact: true })).toBeVisible();
  await expect(page.getByText('* events', { exact: true })).toBeVisible();
  await expect(page.locator('p[role="status"]')).toContainText('content results');
  await expect(page.locator('a[href^="/articles/"]').first()).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Search the website' });
  await search.fill('@about');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('@about');
  await expect(page.getByRole('link', { name: /About us/i })).toBeVisible();

  await search.fill('*events');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('*events');
  await expect(page.locator('p[role="status"]')).toContainText('event results');
  await expect(page.locator('a[href^="/events#"]').first()).toBeVisible();
});
