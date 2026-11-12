import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ref, isReadonly } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { useSiteConfig } from '../app/composables/useSiteConfig';
import { useBusiness } from '../app/composables/useBusiness';
import { useFeature } from '../app/composables/useFeature';
import { resolveBusiness } from '../app/utils/business';
import { resolveAction, resolveNavigation, resolveNavigationGroups } from '../app/utils/navigation';
import { resolveSEO } from '../app/utils/seo';
import type { Business } from '../shared/types/business';
import type { SiteConfig } from '../shared/types/site';
import type { NavigationItem } from '../shared/types/navigation';

const site: SiteConfig = {
  name: 'Example',
  url: 'https://example.com',
  business: { name: 'Example LLC' },
  navigation: { primary: [] },
  locale: { default: 'en-US' },
  seo: {
    title: 'Example',
    titleTemplate: '%s | Example',
    description: 'Default description',
    robots: { index: true, follow: false },
    image: { src: '/default.jpg', alt: 'Default' },
    openGraph: { type: 'website', title: 'Default social title' },
    twitter: { site: '@example' },
  },
};
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: {} },
    { path: '/services', component: {} },
    { path: '/services/:slug', name: 'service', component: {} },
    { path: '/services-other', component: {} },
  ],
});

test('site access is deeply readonly and feature getter updates reactively', () => {
  assert.ok(isReadonly(useSiteConfig()));
  assert.ok(isReadonly(useSiteConfig().business));
  const feature = ref<'contact' | 'payments'>('contact');
  const enabled = useFeature(feature);
  assert.equal(enabled.value, true);
  feature.value = 'payments';
  assert.equal(enabled.value, false);
  const selected = ref<string | undefined>(undefined);
  const business = useBusiness(selected);
  assert.equal(business.value.name, useSiteConfig().business.name);
  selected.value = 'missing';
  assert.equal(business.value.location, undefined);
});

test('business selects primary location and merges partial contacts without mutating data', () => {
  const business: Business = {
    name: 'Acme',
    contact: { phone: '+12345', email: 'main@example.com' },
    locations: [
      { id: 'first', name: 'First', timezone: 'UTC' },
      {
        id: 'main',
        name: 'Main',
        primary: true,
        timezone: 'America/Denver',
        contact: { email: 'local@example.com' },
        address: {
          line1: '12 Main St',
          locality: 'Denver',
          region: 'CO',
          postalCode: '80000',
          countryCode: 'US',
        },
      },
    ],
  };
  const before = JSON.stringify(business);
  const resolved = resolveBusiness(business);
  assert.equal(resolved.location?.id, 'main');
  assert.equal(resolved.contact.phone, '+12345');
  assert.equal(resolved.contact.email, 'local@example.com');
  assert.equal(resolved.address, '12 Main St, Denver, CO 80000, US');
  assert.equal(resolveBusiness(business, 'first').contact.email, 'main@example.com');
  assert.equal(resolveBusiness(business, 'missing').location, undefined);
  assert.equal(resolveBusiness({ name: 'Remote only' }).address, '');
  assert.equal(
    resolveBusiness({ name: 'No primary', locations: business.locations?.slice(0, 1) }).location
      ?.id,
    'first',
  );
  assert.equal(JSON.stringify(business), before);
});

test('actions resolve all variants, named query booleans, disabled and unsafe links', () => {
  const named = resolveAction(
    {
      type: 'route',
      to: {
        name: 'service',
        params: { slug: 'a b' },
        query: { featured: true, tags: ['x', false] },
      },
    },
    router,
  );
  assert.equal(named.href, '/services/a%20b?featured=true&tags=x&tags=false');
  assert.equal(
    resolveAction({ type: 'phone', value: '+1 (555) 123-4567' }, router).href,
    'tel:+15551234567',
  );
  assert.equal(
    resolveAction({ type: 'email', value: 'a+b@example.com' }, router).href,
    'mailto:a%2Bb@example.com',
  );
  assert.equal(resolveAction({ type: 'anchor', href: '#faq' }, router).href, '#faq');
  assert.equal(resolveAction({ type: 'download', href: '/guide.pdf' }, router).download, true);
  assert.equal(
    resolveAction({ type: 'external', href: 'https://example.org', target: '_blank' }, router).rel,
    'noopener noreferrer',
  );
  assert.deepEqual(resolveAction({ type: 'route', to: '/', disabled: true }, router), {
    disabled: true,
  });
  for (const href of ['javascript:alert(1)', 'data:text/html,hello', '//evil.test']) {
    assert.equal(resolveAction({ type: 'external', href }, router).disabled, true);
    assert.equal(resolveAction({ type: 'route', to: href }, router).disabled, true);
  }
  assert.equal(
    resolveAction({ type: 'email', value: 'a@example.com?subject=Injected' }, router).disabled,
    true,
  );
  assert.equal(resolveAction({ type: 'route', to: { name: 'missing' } }, router).disabled, true);
});

test('navigation filters nested visibility, orders stably and matches path boundaries', () => {
  const items: NavigationItem[] = [
    { label: 'Home', action: { type: 'route', to: '/' } },
    {
      label: 'Services',
      order: 1,
      action: { type: 'route', to: '/services' },
      children: [
        {
          label: 'Private',
          visibility: 'authenticated',
          action: { type: 'route', to: '/services/private' },
        },
        { label: 'Guest', visibility: 'guest', action: { type: 'route', to: '/services/guest' } },
      ],
    },
    {
      label: 'Empty',
      children: [
        { label: 'Private', visibility: 'authenticated', action: { type: 'route', to: '/' } },
      ],
    },
  ];
  const before = JSON.stringify(items);
  const guest = resolveNavigation(items, router, '/services/guest');
  assert.deepEqual(
    guest.map((item) => item.label),
    ['Services', 'Home'],
  );
  assert.equal(guest[0]?.active, true);
  assert.equal(guest[0]?.exactActive, false);
  assert.equal(guest[1]?.active, false);
  assert.deepEqual(
    guest[0]?.children.map((item) => item.label),
    ['Guest'],
  );
  assert.equal(resolveNavigation(items, router, '/services-other')[0]?.active, false);
  assert.equal(resolveNavigation(items, router, '/services/')[0]?.exactActive, true);
  assert.equal(resolveNavigation(items, router, '/', true)[0]?.children[0]?.label, 'Private');
  assert.deepEqual(
    resolveNavigationGroups(
      [
        {
          items: [
            {
              label: 'Only private',
              visibility: 'authenticated',
              action: { type: 'route', to: '/' },
            },
          ],
        },
      ],
      router,
      '/',
    ),
    [],
  );
  assert.equal(JSON.stringify(items), before);
});

function content(head: ReturnType<typeof resolveSEO>, key: string) {
  return head.meta.find((meta) => meta.key === key)?.content;
}

test('SEO merges nested defaults, strips canonical query/hash and uses page social fallbacks', () => {
  const before = JSON.stringify(site);
  const head = resolveSEO(
    site,
    {
      title: 'Services',
      robots: { index: false },
      image: { src: '/page.jpg', alt: 'Page', width: 1200, height: 630 },
    },
    '/services?utm_source=test#faq',
  );
  assert.equal(head.title, 'Services | Example');
  assert.equal(head.link[0]?.href, 'https://example.com/services');
  assert.equal(content(head, 'robots'), 'noindex, nofollow');
  assert.equal(content(head, 'og:title'), 'Services | Example');
  assert.equal(content(head, 'twitter:title'), 'Services | Example');
  assert.equal(content(head, 'og:image'), 'https://example.com/page.jpg');
  assert.equal(content(head, 'twitter:image'), 'https://example.com/page.jpg');
  assert.equal(content(head, 'og:image:width'), '1200');
  assert.equal(content(head, 'twitter:site'), '@example');
  assert.equal(content(head, 'og:locale'), 'en_US');
  assert.equal(JSON.stringify(site), before);
  assert.equal(resolveSEO(site).title, 'Example');
  assert.equal(
    resolveSEO(site, { title: 'Standalone', useTitleTemplate: false }).title,
    'Standalone',
  );
});

test('SEO supports explicit canonicals, alternates, article metadata and safe URL schemes', () => {
  const head = resolveSEO(site, {
    canonical: '/story?tracking=yes#part',
    locale: 'fr-FR',
    alternateLocales: ['en-US'],
    alternateLanguages: [
      { hreflang: 'en', href: '/en/story' },
      { hreflang: 'bad', href: 'javascript:alert(1)' },
    ],
    article: {
      publishedAt: '2026-01-01',
      authors: [{ name: 'Author', url: '/author' }],
      tags: ['News', 'Local'],
    },
    openGraph: { title: 'Social override' },
    twitter: { title: 'Twitter override' },
  });
  assert.equal(head.link[0]?.href, 'https://example.com/story');
  assert.equal(head.link.length, 2);
  assert.equal(head.htmlAttrs.lang, 'fr-FR');
  assert.equal(content(head, 'og:locale:en-US'), 'en_US');
  assert.equal(content(head, 'og:type'), 'article');
  assert.equal(content(head, 'article:author:0'), 'https://example.com/author');
  assert.equal(content(head, 'article:tag:1'), 'Local');
  assert.equal(content(head, 'twitter:title'), 'Twitter override');
  assert.equal(
    content(resolveSEO(site, { canonical: 'javascript:bad' }, '/safe'), 'og:url'),
    'https://example.com/safe',
  );
  assert.equal(
    content(resolveSEO(site, { image: { src: 'javascript:bad', alt: '' } }), 'og:image'),
    undefined,
  );
  assert.throws(() => resolveSEO({ ...site, url: 'not-an-origin' }), /SiteConfig.url/);
  assert.equal(content(resolveSEO(site), 'article:tag:1'), undefined);
});

test('head renderer emits escaped SSR metadata and replaces stale reactive tags', async () => {
  const { createHead, renderSSRHead } = await import('@unhead/vue/server');
  const { useHead } = await import('@unhead/vue');
  const { effectScope, nextTick } = await import('vue');
  const head = createHead();
  const page = ref<import('../shared/types/seo').SEO>({
    title: '<script>alert(1)</script>',
    article: { tags: ['Old tag'] },
  });
  const path = ref('/first?tracking=1');
  const scope = effectScope();
  scope.run(() => useHead(() => resolveSEO(site, page.value, path.value), { head }));
  try {
    const first = await renderSSRHead(head);
    assert.ok(first.headTags.includes('&lt;script&gt;'));
    assert.match(first.headTags, /<title>[^<]*&lt;script&gt;[^<]*<\/title>/);
    assert.match(first.headTags, /rel="canonical" href="https:\/\/example.com\/first"/);
    assert.ok(first.headTags.includes('Old tag'));
    // SSR is a one-shot snapshot; reactive updates use Unhead's client mode.
    const { createHead: createClientHead } = await import('@unhead/vue/client');
    const clientHead = createClientHead({ render: () => {} });
    scope.run(() => useHead(() => resolveSEO(site, page.value, path.value), { head: clientHead }));
    page.value = { title: 'Second' };
    path.value = '/second';
    await nextTick();
    const second = await renderSSRHead(clientHead);
    assert.ok(second.headTags.includes('Second | Example'));
    assert.ok(!second.headTags.includes('Old tag'));
    assert.ok(!second.headTags.includes('https://example.com/first'));
    assert.equal((second.headTags.match(/rel="canonical"/g) ?? []).length, 1);
    const otherHead = createHead();
    otherHead.push(resolveSEO(site, { title: 'Other request' }, '/other'));
    assert.ok(!(await renderSSRHead(otherHead)).headTags.includes('Second | Example'));
  } finally {
    scope.stop();
  }
});
