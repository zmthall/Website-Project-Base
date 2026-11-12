// TODO [SEO-01]: Build sitemap entries from all authoritative published records and validate canonical origin/schema; omit drafts, samples, expired/private paths and unsupported detail routes. See docs/integration-audit.md.
import { isFeaturePathEnabled } from '../../shared/utils/features';
import { blogStore } from '../utils/blog-store';
import { site } from '../../shared/data/site';
import { demoSection } from '../../app/data/demo';
import { indexingAllowed, sitemapXML } from '../../shared/utils/discovery';
export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  const enabled = indexingAllowed(useRuntimeConfig(event).indexingEnabled, site.url);
  // Derive dynamic routes from the same records rendered by the current demo pages.
  // Client integrations should add their published event/job/location records here.
  const entries: { path: string; modifiedAt?: string }[] = [
    ...[
      '/',
      '/about',
      '/contact',
      '/appointments',
      '/estimates',
      '/faq',
      '/services',
      '/articles',
      '/blog',
      '/careers',
      '/careers/apply',
      '/events',
      '/reviews',
      '/newsletter',
      '/privacy',
      '/terms',
    ].map((path) => ({ path })),
    ...(demoSection.services ?? []).map((service) => ({ path: `/services/${service.slug}` })),
    ...(demoSection.articles ?? []).map((article) => ({
      path: `/articles/${article.slug}`,
      modifiedAt: article.publishedAt,
    })),
  ];
  if (enabled && site.features.blog) {
    for (const post of await blogStore().list(true))
      entries.push({ path: '/blog/' + post.slug, modifiedAt: post.updatedAt });
  }
  return sitemapXML(
    site.url,
    enabled ? entries.filter((entry) => isFeaturePathEnabled(site.features, entry.path)) : [],
  );
});
