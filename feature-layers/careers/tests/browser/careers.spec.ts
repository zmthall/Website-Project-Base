// TODO [OPS-02]: Run mandatory authenticated workflows in CI with isolated seeded accounts and test signed webhooks, cross-account access, distributed conflicts, backup restore and restart recovery. See docs/integration-audit.md.
import { test, expect, request as apiRequest } from '@playwright/test';
import { site } from '../../../../shared/data/site';
test('careers landing, job details, notices and private applications', async ({
  page,
  request,
}) => {
  test.skip(
    !site.features.careers || !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    'Requires careers and test admin credentials.',
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const title = `Browser opportunity ${Date.now()}`;
  const email = `career-browser-${Date.now()}@example.com`;
  await page.goto('/admin/login');
  await page.getByLabel(/^Email address\*?$/).fill(process.env.TEST_ADMIN_EMAIL!);
  await page.getByLabel(/^Password\*?$/).fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/jobs');
  await page.getByRole('button', { name: 'Create opening' }).click();
  await page.getByLabel(/^Job title\*?$/).fill(title);
  await page.getByLabel(/^Department\*?$/).fill('Operations');
  await page.getByLabel(/^Location\*?$/).fill('Denver, CO');
  await page
    .getByLabel(/^Job description\*?$/)
    .fill('Help customers and collaborate with the team.');
  await page
    .getByLabel('Responsibilities', { exact: true })
    .fill('Respond to questions\nShare useful feedback');
  await page.getByLabel('Shifts', { exact: true }).fill('Weekdays');
  await page.getByRole('dialog').getByLabel('Status', { exact: true }).selectOption('open');
  await page.getByRole('button', { name: 'Save opening' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.goto('/careers');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Good work');
  const details = page.getByRole('button', { name: `Job details: ${title}` });
  await details.click();
  await expect(page.getByRole('dialog')).toContainText('Respond to questions');
  await page.keyboard.press('Escape');
  await expect(details).toBeFocused();
  await page.getByRole('link', { name: `Apply for ${title}`, exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to application' })).toBeDisabled();
  await page.getByLabel('I have read and understand the application notice.').check();
  await page.getByRole('button', { name: 'Continue to application' }).click();
  await expect(page.getByLabel(/^Position\*?$/)).not.toHaveValue('general');
  await page.getByLabel(/^Full name\*?$/).fill('Career Browser Applicant');
  await page.getByLabel(/^Email address\*?$/).fill(email);
  await page.getByLabel(/^Phone number\*?$/).fill('555-123-4567');
  await page.getByLabel(/^City and region\*?$/).fill('Denver, CO');
  await page.getByLabel(/^Availability\*?$/).fill('Weekdays');
  await page.getByLabel(/^Relevant experience\*?$/).fill('Customer support experience.');
  await page.getByLabel('I confirm that the information provided is accurate.').check();
  await page
    .getByLabel(
      'I agree to have my application information stored for the team to review and contact me.',
    )
    .check();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByRole('heading', { name: 'Application received.' })).toBeVisible();
  await page.goto('/admin/applications');
  const row = page.getByRole('row').filter({ hasText: email });
  await row.getByRole('button', { name: 'Edit Career Browser Applicant' }).click();
  await expect(page.getByLabel(/^Applicant name\*?$/)).toHaveAttribute('readonly', '');
  await page.getByLabel('Internal notes', { exact: true }).fill('Contact this applicant.');
  await page.getByRole('dialog').getByLabel('Status', { exact: true }).selectOption('reviewing');
  await page.getByRole('button', { name: 'Save application' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(row).toContainText('reviewing');
  const session = await (await page.request.get('/api/admin/auth/session')).json();
  const applications = await (await page.request.get('/api/admin/manage/applications')).json();
  const application = applications.items.find(
    (item: { fields: { email: string } }) => item.fields.email === email,
  );
  const altered = await page.request.put(`/api/admin/manage/applications/${application.id}`, {
    headers: { 'X-CSRF-Token': session.csrfToken },
    data: {
      version: application.version,
      fields: {
        ...application.fields,
        name: 'Altered applicant',
        consentAt: 'forged',
        notes: 'Reviewed',
        status: 'contacted',
      },
    },
  });
  expect(altered.ok()).toBe(true);
  const preserved = await altered.json();
  expect(preserved.fields.name).toBe('Career Browser Applicant');
  expect(preserved.fields.consentAt).toBe(application.fields.consentAt);
  expect(preserved.fields.status).toBe('contacted');
  const privateList = await request.get('/api/content/applications');
  expect(privateList.status()).toBe(404);
  const unauthenticated = await apiRequest.newContext({ baseURL: 'http://127.0.0.1:43188' });
  const protectedList = await unauthenticated.get('/api/admin/manage/applications');
  expect(protectedList.status()).toBe(401);
  await unauthenticated.dispose();
  expect(errors).toEqual([]);
});
