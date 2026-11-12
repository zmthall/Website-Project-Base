import { test } from 'node:test';
import assert from 'node:assert/strict';
import { structuredDataNodes, serializeStructuredData } from '../app/utils/structured-data';
import { site } from '../shared/data/site';
import { demoArticle, demoSection } from '../app/data/demo';
import { indexingAllowed, robotsText, sitemapXML } from '../shared/utils/discovery';
test('JSON-LD maps visible domain content, deduplicates IDs and escapes script delimiters', () => {
  const nodes = structuredDataNodes(site, [
    { kind: 'organization' },
    { kind: 'organization' },
    { kind: 'website' },
    {
      kind: 'article',
      article: { ...demoArticle, title: '</script><script>alert(1)</script>' },
      path: '/articles/example',
    },
    { kind: 'faq', items: demoSection.faqs ?? [], path: '/faq' },
    { kind: 'service', service: demoSection.services![0]!, path: '/services/example' },
    {
      kind: 'breadcrumbs',
      items: [
        { name: 'Home', path: '/' },
        { name: 'Unsafe', path: 'javascript:alert(1)' },
      ],
    },
  ]);
  assert.equal(nodes.length, 6);
  assert.equal(
    nodes.find((n) => n['@type'] === 'Article')?.headline,
    '</script><script>alert(1)</script>',
  );
  assert.ok(!serializeStructuredData(nodes).includes('<'));
  assert.equal(
    (nodes.find((n) => n['@type'] === 'BreadcrumbList')?.itemListElement as unknown[]).length,
    1,
  );
  assert.ok(!serializeStructuredData(nodes).includes('aggregateRating'));
});
test('discovery excludes private entries, deduplicates canonical paths and escapes XML', () => {
  const xml = sitemapXML('https://business.test', [
    { path: '/' },
    { path: '/?q=one' },
    { path: '/private', index: false },
    { path: '//evil.test' },
    { path: '/a&b', modifiedAt: '2026-01-01' },
  ]);
  assert.equal((xml.match(/<url>/g) ?? []).length, 2);
  assert.ok(xml.includes('/a&amp;b'));
  assert.ok(!xml.includes('private'));
  assert.equal(indexingAllowed('false', 'https://business.test'), false);
  assert.equal(indexingAllowed(true, 'https://www.example.com'), false);
  assert.equal(indexingAllowed('true', 'https://business.test'), true);
  assert.equal(robotsText('https://business.test', false), 'User-agent: *\nDisallow: /\n');
});
