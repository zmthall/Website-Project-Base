import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('admin backend unavailability does not grant access', async ({ page }) => {
  await page.route('**/api/admin/**', (route) =>
    route.fulfill({ status: 503, json: { message: 'Unavailable' } }),
  );
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('navigation', { name: 'Administration', exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('unavailable');
  await expect(page.getByRole('heading', { name: 'Your account' })).toHaveCount(0);
});

test('admin account state, settings, and logout use backend contracts', async ({ page }) => {
  let loggedIn = false;
  let update: Record<string, unknown> | undefined;
  const settings = {
    provider: 'local',
    sessionDurationMinutes: 480,
    idleTimeoutMinutes: 30,
    requireVerifiedEmail: true,
    firebase: { projectId: '', apiKey: '', authDomain: '', credentialsConfigured: false },
    supabase: { url: '', publishableKey: '', credentialsConfigured: false },
  };
  const session = {
    provider: 'local',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    idleExpiresAt: new Date(Date.now() + 1800000).toISOString(),
    account: {
      id: '1',
      displayName: 'Example Admin',
      email: 'admin@example.com',
      emailVerified: true,
      roles: ['admin'],
      permissions: ['auth:configure'],
      createdAt: '2025-01-01T00:00:00Z',
      lastLoginAt: '2026-01-02T12:00:00Z',
      previousLoginAt: '2026-01-01T12:00:00Z',
    },
  };
  await page.route('**/api/admin/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() !== 'GET') expect(request.headers()['x-csrf-token']).toBe('csrf-test');
    if (path.endsWith('/login')) loggedIn = true;
    if (path.endsWith('/logout')) {
      loggedIn = false;
      return route.fulfill({ status: 204 });
    }
    if (path.endsWith('/settings/auth')) {
      if (request.method() === 'PUT') {
        update = request.postDataJSON();
        return route.fulfill({ status: 204 });
      }
      return route.fulfill({ json: settings });
    }
    return route.fulfill({
      json: { provider: 'local', csrfToken: 'csrf-test', session: loggedIn ? session : null },
    });
  });
  await page.goto('/admin/login');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('admin@example.com');
  await page.locator('input[type="password"]').fill('example-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page
      .getByRole('navigation', { name: 'Administration', exact: true })
      .getByRole('link', { name: 'Dashboard' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Example Admin');
  await expect(page.getByText('Email verified', { exact: true })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Administration', exact: true })
    .getByRole('link', { name: 'Authentication', exact: true })
    .click();
  await page.getByLabel('Admin session duration (minutes)').fill('120');
  await page.getByRole('button', { name: 'Save authentication settings' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Settings saved' })).toBeVisible();
  expect((update?.settings as Record<string, unknown>)?.sessionDurationMinutes).toBe(120);
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
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: 'Your account' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByText('Checking administrator access…', { exact: true })).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('admin@example.com');
  await page.locator('input[type="password"]').fill('example-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Example Admin');
});

test('navigation between admin and public pages switches layouts', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('navigation', { name: 'Administration', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View website', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('navigation', { name: 'Administration', exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('navigation', { name: 'Primary navigation', exact: true }),
  ).toBeVisible();
});
