import { test, expect } from '@playwright/test';
test('customer registration, sign-out, and sign-in work without a page refresh', async ({
  page,
}) => {
  let loggedIn = false;
  const session = {
    provider: 'local',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    idleExpiresAt: new Date(Date.now() + 1800000).toISOString(),
    account: {
      id: 'customer-1',
      email: 'customer@example.com',
      displayName: 'Customer',
      emailVerified: false,
      roles: ['customer'],
    },
  };
  await page.route('**/api/customer/auth/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === 'POST')
      expect(route.request().headers()['x-csrf-token']).toBe('customer-csrf');
    if (path.endsWith('/login') || path.endsWith('/register')) loggedIn = true;
    if (path.endsWith('/logout')) {
      loggedIn = false;
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({
      json: { provider: 'local', csrfToken: 'customer-csrf', session: loggedIn ? session : null },
    });
  });
  await page.goto('/customer');
  await expect(page).toHaveURL(/\/customer\/login$/);
  await page.getByRole('button', { name: 'Create a customer account', exact: true }).click();
  await page.getByLabel('Email address', { exact: true }).fill('customer@example.com');
  await page.getByLabel('Password', { exact: true }).fill('strong-test-password');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/\/customer$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Customer');
  await expect(
    page.getByRole('navigation', { name: 'Customer account', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/customer\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByText('Checking customer access…', { exact: true })).toHaveCount(0);
  await page.getByLabel('Email address', { exact: true }).fill('customer@example.com');
  await page.getByLabel('Password', { exact: true }).fill('strong-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/customer$/);
  await page.getByRole('link', { name: 'View website', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Customer account', exact: true })).toHaveCount(
    0,
  );
  const primary = page.getByRole('navigation', { name: 'Primary navigation', exact: true });
  await expect(primary.getByRole('link', { name: 'My account', exact: true })).toBeVisible();
  await expect(primary.getByRole('link', { name: 'Sign in / Register', exact: true })).toHaveCount(
    0,
  );
});

test('main navigation exposes customer sign-in on desktop and mobile', async ({ page }) => {
  await page.route('**/api/customer/auth/session', (route) =>
    route.fulfill({ json: { provider: 'local', csrfToken: 'guest-csrf', session: null } }),
  );
  const sessionRestored = page.waitForResponse('**/api/customer/auth/session');
  await page.goto('/');
  await sessionRestored;
  const primary = page.getByRole('navigation', { name: 'Primary navigation', exact: true });
  await expect(
    primary.getByRole('link', { name: 'Sign in / Register', exact: true }),
  ).toBeVisible();
  await expect(primary.getByRole('link', { name: 'My account', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Essential only' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Sign in / Register', exact: true })
    .click();
  await expect(page).toHaveURL(/\/customer\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});
