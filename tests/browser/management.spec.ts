import { test, expect } from '@playwright/test';
test('admin publishes database Markdown and keeps drafts private', async ({ page, request }) => {
  test.skip(
    !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    'Set test administrator credentials for live CMS verification.',
  );
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const slug = 'browser-blog-' + Date.now();
  const title = `Database Markdown example ${slug}`;
  await page.goto('/admin/login');
  await page.getByLabel(/^Email address\*?$/).fill(process.env.TEST_ADMIN_EMAIL!);
  await page.getByLabel(/^Password\*?$/).fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/blog');
  await page.getByRole('button', { name: 'Create post' }).click();
  await expect(page.getByLabel(/^Title\*?$/)).toHaveClass(/\binput\b/);
  await expect(page.getByLabel(/^Status\*?$/).last()).toHaveClass(/\binput\b/);
  await page.getByLabel(/^Title\*?$/).fill(title);
  await page.getByLabel('Slug', { exact: false }).fill(slug);
  await page.getByLabel(/^Summary\*?$/).fill('Example database post');
  await page.getByLabel(/^Author\*?$/).fill('Team');
  const markdown = page.getByLabel(/^Markdown content\*?$/);
  await expect(markdown).toHaveClass(/\binput\b/);
  await page.getByRole('button', { name: 'H2', exact: true }).click();
  await expect(markdown).toHaveValue('## Heading');
  await expect(
    page.locator('.markdown-body').getByRole('heading', { name: 'Heading', exact: true }),
  ).toBeVisible();
  await markdown.fill('');
  await page.getByRole('button', { name: 'Callout', exact: true }).click();
  await expect(page.locator('.post-callout')).toContainText('Important information.');
  const content =
    '## A heading\n\n**Strong text** and a list:\n\n- First\n- Second\n\n::post-callout{title="Remember"}\nLive custom prose.\n::\n\n::centered-action{to="/contact"}\nContact our team\n::\n\n::post-cta-tile{to="/about" title="About"}\nAbout our team\n::\n\n[Visit](/about)';
  await markdown.fill(content);
  await expect(page.locator('.post-callout')).toContainText('Live custom prose.');
  await expect(
    page.locator('.markdown-body').getByRole('link', { name: 'Contact our team', exact: true }),
  ).toHaveAttribute('href', '/contact');
  await expect(page.locator('.markdown-body').getByRole('link', { name: 'Visit' })).toHaveAttribute(
    'href',
    '/about',
  );
  await markdown.fill(
    Array.from({ length: 100 }, (_, index) => `## Section ${index}\n\nParagraph ${index}.`).join(
      '\n\n',
    ),
  );
  await expect(page.locator('.markdown-preview')).toContainText('Paragraph 99.');
  await markdown.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
  await expect
    .poll(() => page.locator('.markdown-preview').evaluate((element) => element.scrollTop))
    .toBeGreaterThan(100);
  await page.locator('.markdown-preview').evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event('scroll'));
  });
  await expect.poll(() => markdown.evaluate((element) => element.scrollTop)).toBeLessThan(2);
  await page.getByLabel('Sync scrolling').uncheck();
  await markdown.fill(content);

  await expect(
    page.locator('.markdown-body strong').filter({ hasText: /^Strong text$/ }),
  ).toHaveText('Strong text');
  await page.setViewportSize({ width: 390, height: 844 });
  const sourceBox = await markdown.boundingBox();
  const previewBox = await page.locator('.markdown-preview').boundingBox();
  expect(previewBox!.y).toBeGreaterThan(sourceBox!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('button', { name: 'Save post' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await request.get('/api/blog/' + slug)).status()).toBe(404);
  await page.getByRole('button', { name: `Edit ${title}` }).click();
  await page.getByRole('dialog').getByLabel('Status', { exact: false }).selectOption('published');
  await page.getByRole('button', { name: 'Save post' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/blog/' + slug);
  await expect(
    page.locator('.markdown-body strong').filter({ hasText: /^Strong text$/ }),
  ).toHaveText('Strong text');
  await expect(page.locator('.post-callout')).toContainText('Live custom prose.');
  await expect(
    page.locator('.markdown-body').getByRole('link', { name: 'Contact our team', exact: true }),
  ).toHaveAttribute('href', '/contact');
  await expect(page.locator('.post-prose-h2').first()).toHaveText('A heading');
  const link = page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'A heading' });
  const href = await link.getAttribute('href');
  await expect(page.locator('.markdown-body').locator(href!)).toHaveText('A heading');
  expect(pageErrors).toEqual([]);
});

test('admin API protects records and publishes moderated content', async ({ request }) => {
  test.skip(
    !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    'Test credentials required',
  );
  expect((await request.get('/api/admin/manage/messages')).status()).toBe(401);
  const session = await (await request.get('/api/admin/auth/session')).json();
  const login = await request.post('/api/admin/auth/login', {
    headers: { 'X-CSRF-Token': session.csrfToken },
    data: { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD },
  });
  expect(login.ok()).toBe(true);
  const auth = await login.json();
  const headers = { 'X-CSRF-Token': auth.csrfToken };
  expect((await request.post('/api/admin/manage/events', { data: { fields: {} } })).status()).toBe(
    403,
  );
  const created = await request.post('/api/admin/manage/events', {
    headers,
    data: {
      fields: {
        title: 'API event',
        date: '2090-01-01',
        startTime: '09:00',
        endTime: '10:00',
        timeZone: 'America/Denver',
        category: 'Community',
        location: 'Town hall',
        description: 'Gathering',
        status: 'published',
      },
    },
  });
  expect(created.ok()).toBe(true);
  const event = await created.json();
  expect(
    (await (await request.get('/api/content/events')).json()).some(
      (item: { id: string }) => item.id === event.id,
    ),
  ).toBe(true);
  const contact = await request.post('/api/contact', {
    data: {
      name: 'Example',
      email: 'example@example.com',
      reason: 'general',
      message: 'Saved inquiry',
      consent: { granted: true },
    },
  });
  expect(contact.ok()).toBe(true);
  const messages = await (await request.get('/api/admin/manage/messages')).json();
  expect(
    messages.items.some(
      (item: { fields: { message: string } }) => item.fields.message === 'Saved inquiry',
    ),
  ).toBe(true);
  expect((await request.get('/api/content/messages')).status()).toBe(404);
  expect(
    (
      await request.post('/api/reviews', {
        data: {
          name: 'API reader',
          content: 'Review for moderation',
          rating: 5,
          status: 'published',
        },
      })
    ).ok(),
  ).toBe(true);
  const reviews = await (await request.get('/api/admin/manage/reviews')).json();
  const review = reviews.items.find(
    (item: { fields: { name: string } }) => item.fields.name === 'API reader',
  );
  expect(review.fields.status).toBe('pending');
  expect(
    (
      await request.put('/api/admin/manage/reviews/' + review.id, {
        headers,
        data: {
          fields: { ...review.fields, status: 'published', notes: 'Private moderation note' },
          version: review.version,
        },
      })
    ).ok(),
  ).toBe(true);
  const publicReview = (await (await request.get('/api/content/reviews')).json()).find(
    (item: { id: string }) => item.id === review.id,
  );
  expect(publicReview.fields.notes).toBeUndefined();
  expect(
    (
      await request.post('/api/newsletter/subscriptions', {
        data: { email: 'reader@example.com', consent: { granted: true } },
      })
    ).ok(),
  ).toBe(true);
  const newsletter = await request.post('/api/admin/manage/newsletters', {
    headers,
    data: {
      fields: {
        title: 'API issue',
        issue: 'Issue 1',
        summary: 'News',
        content: '## Update\n\nNewsletter body',
        status: 'published',
      },
    },
  });
  expect(newsletter.ok()).toBe(true);
  expect((await (await request.get('/api/content/newsletters')).json()).length).toBeGreaterThan(0);
  const issue = await newsletter.json();
  for (const [kind, record] of [
    ['events', event],
    ['reviews', publicReview],
    ['newsletters', issue],
  ] as const) {
    expect(
      (
        await request.delete('/api/admin/manage/' + kind + '/' + record.id, {
          headers,
          data: { version: record.version },
        })
      ).ok(),
    ).toBe(true);
  }
});
