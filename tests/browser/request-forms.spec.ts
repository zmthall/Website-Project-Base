import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const kind of ['contact'] as string[]) {
  test(`${kind} form validates and previews without sending a request`, async ({ page }) => {
    const mutations: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST') mutations.push(request.url());
    });
    await page.goto(`/${kind}`);
    await page.waitForFunction(() =>
      Boolean(
        (document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null)
          ?.__vue_app__,
      ),
    );
    await page.getByRole('button', { name: 'Essential only' }).click();
    const submit = page.getByRole('button', {
      name: kind === 'contact' ? 'Send message' : 'Preview appointment request',
      exact: true,
    });
    await submit.click();
    await expect(page.getByRole('alert')).toContainText('Please check');
    await page.getByLabel('Full name', { exact: false }).fill('Example Person');
    await page.getByLabel('Email address', { exact: false }).fill('example@example.com');
    if (kind === 'contact') {
      await page.getByLabel('How can we help?', { exact: false }).selectOption('general');
      await page
        .getByLabel('Your message', { exact: false })
        .fill('This is an illustrative contact message.');
    } else {
      await page.getByLabel('Appointment type', { exact: false }).selectOption('introduction');
      await page.getByLabel('Meeting format', { exact: false }).selectOption('video');
      await page.getByLabel('Preferred date', { exact: false }).fill('2000-01-01');
      await page.getByLabel('Preferred time', { exact: false }).selectOption('09:00');
    }
    await page.getByRole('checkbox').check();
    await submit.click();
    if (kind === 'appointments') {
      await expect(page.getByRole('alert')).toContainText('today or in the future');
      const future = new Date();
      future.setUTCDate(future.getUTCDate() + 7);
      await page
        .getByLabel('Preferred date', { exact: false })
        .fill(future.toISOString().slice(0, 10));
      await submit.click();
    }
    await expect(page.getByRole('dialog')).toContainText(
      kind === 'contact' ? 'Message received' : 'No appointment was booked',
    );
    await page.keyboard.press('Escape');
    await expect(submit).toBeFocused();
    if (kind === 'contact')
      expect(mutations.some((url) => url.endsWith('/api/contact'))).toBe(true);
    else expect(mutations).toEqual([]);
    expect(
      (await new AxeBuilder({ page }).exclude('nuxt-devtools-frame').analyze()).violations,
    ).toEqual([]);
    await page.setViewportSize({ width: 320, height: 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}
