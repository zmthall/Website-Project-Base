import { site } from '../../shared/data/site';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('business demo is responsive and accessible in light and dark modes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt') as
      | (Element & {
          __vue_app__?: { config: { globalProperties: { $nuxt?: { isHydrating: boolean } } } };
        })
      | null;
    return root?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false;
  });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Good work');
  await page.getByRole('button', { name: 'Essential only' }).click();
  for (const width of [1440, 1024, 768, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await page.screenshot({ path: `/tmp/ui-home-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const mode of ['light', 'dark']) {
    await page.getByRole('combobox', { name: 'Color mode', exact: true }).selectOption(mode);
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', mode);
    const results = await new AxeBuilder({ page })
      .exclude('nuxt-devtools-frame')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('showcase controls apply theme settings and overlays support keyboard dismissal', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/showcase');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  await page.getByRole('combobox', { name: 'Button shape', exact: true }).selectOption('round');
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--button-radius').trim(),
      ),
    )
    .toBe('999px');
  await page.getByRole('combobox', { name: 'Color mode policy', exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open drawer', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Form example', exact: true }).selectOption('issue');
  await page.getByRole('button', { name: 'Preview report', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Please check the following fields' }),
  ).toBeVisible();
  const form = page.locator('form').filter({ hasText: 'Report an issue' });
  await form.getByLabel('Reply email').fill('person@example.com');
  await form.getByLabel('Issue category').selectOption('other');
  await expect(form.getByLabel('Describe the category')).toBeVisible();
  await form.getByLabel('Describe the category').fill('Example');
  await form.getByLabel('What happened?').fill('This is a demonstration issue.');
  await page.getByRole('button', { name: 'Preview report', exact: true }).click();
  await expect(page.getByText('Example validated', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('all registered section variants render without client errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/showcase/sections');
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt') as
      | (Element & {
          __vue_app__?: { config: { globalProperties: { $nuxt?: { isHydrating: boolean } } } };
        })
      | null;
    return root?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false;
  });
  const select = page.getByRole('combobox', { name: 'Section variant', exact: true });
  await expect(select).toBeVisible();
  const values = await select
    .locator('option')
    .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
  expect(values.length).toBeGreaterThan(50);
  for (const value of values) {
    await select.selectOption(value);
    const [family, variant] = value.split('-');
    await expect(
      page.locator(`#section-preview[data-family="${family}"][data-variant="${variant}"]`),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('mobile navigation opens, closes, and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  const trigger = page.getByRole('button', { name: 'Open navigation' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('showcase is accessible and responsive', async ({ page }) => {
  await page.goto('/showcase');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  for (const width of [1440, 1024, 768, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  }
  for (const mode of ['light', 'dark']) {
    await page.getByRole('combobox', { name: 'Color mode policy', exact: true }).selectOption(mode);
    const results = await new AxeBuilder({ page })
      .exclude('nuxt-devtools-frame')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});

test('gallery keyboard controls and file removal work locally', async ({ page }) => {
  await page.goto('/showcase');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  const opener = page.getByRole('button', { name: /^Enlarge/ }).first();
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('2 / 3', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await page.getByLabel('Choose files', { exact: true }).setInputFiles({
    name: 'example.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Example upload'),
  });
  const remove = page.getByRole('button', { name: 'Remove example.txt' });
  await expect(remove).toBeVisible();
  await remove.click();
  await expect(remove).toHaveCount(0);
});

test('demo routes and feature screens render, including an honest empty search state', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of [
    '/about',
    '/contact',
    '/faq',
    '/services',
    '/services/service-0',
    '/articles',
    '/articles/article-0',
    ...(site.features.events ? ['/events'] : []),
    '/privacy',
    '/terms',
    '/showcase/screens',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  const select = page.getByRole('combobox', { name: 'Screen', exact: true });
  const values = await select
    .locator('option')
    .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
  expect(values.length).toBe(12);
  for (const value of values) await select.selectOption(value);
  await select.selectOption('search');
  await page.getByRole('searchbox').fill('not-a-real-result');
  await expect(page.getByText('No matching resources', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('animated navigation preserves the selected theme', async ({ page }) => {
  await page.goto('/showcase');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  await page.getByRole('button', { name: 'Essential only' }).click();
  await page.getByRole('combobox', { name: 'Color mode policy', exact: true }).selectOption('dark');
  await page.getByRole('switch', { name: 'Animated page transitions' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'true');
  const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true });
  for (const [label, title] of [
    ['About', 'Good people. Considered work.'],
    ['Services', 'A thoughtful approach to your next chapter.'],
    ['Resources', 'Ideas worth sharing.'],
  ] as const) {
    const link = nav.getByRole('link', { name: label, exact: true });
    const destination = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');
  }
});

test('SEO discovery remains safe by default', async ({ page, request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Disallow: /');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain('<url>');
  const response = await page.goto('/articles/article-0');
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
        ?.__vue_app__,
    ),
  );
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(
    graphs.some((value) =>
      JSON.parse(value)['@graph'].some((node: { '@type': string }) => node['@type'] === 'Article'),
    ),
  ).toBe(true);
  await page
    .getByRole('navigation', { name: 'Primary navigation', exact: true })
    .getByRole('link', { name: 'About', exact: true })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect
    .poll(async () =>
      (await page.locator('script[type="application/ld+json"]').allTextContents()).some((value) =>
        value.includes('"@type":"Article"'),
      ),
    )
    .toBe(false);
});
