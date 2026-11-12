// TODO [SEO-01]: Build sitemap entries from all authoritative published records and validate canonical origin/schema; omit drafts, samples, expired/private paths and unsupported detail routes. See docs/integration-audit.md.
import type { DeepReadonly } from 'vue';
import type { SiteConfig } from '../../shared/types/site';
import type { SEO } from '../../shared/types/seo';
import type { ImageMedia } from '../../shared/types/image';

/** Only public HTTP(S) URLs are suitable for canonical/social metadata. */
function publicURL(
  value: string | undefined,
  base: string,
  stripQuery = false,
): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, base);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
      return undefined;
    url.hash = '';
    if (stripQuery) url.search = '';
    return url.href;
  } catch {
    return undefined;
  }
}

/** Pure resolver shared by the reactive composable and SSR regression tests. */
export function resolveSEO(
  site: DeepReadonly<SiteConfig>,
  page: DeepReadonly<SEO> = {},
  path = '/',
) {
  const defaults = site.seo;
  const base = publicURL(site.url, site.url);
  if (!base) throw new Error('SiteConfig.url must be an absolute HTTP(S) URL without credentials.');
  const rawTitle = page.title ?? defaults.title ?? site.name;
  const template = defaults.titleTemplate;
  // Do not append the brand to the site's own default title.
  const title =
    page.title !== undefined &&
    (page.useTitleTemplate ?? defaults.useTitleTemplate ?? true) &&
    template
      ? template.replace(/%s/g, () => rawTitle)
      : rawTitle;
  const description = page.description ?? defaults.description;
  const canonical =
    publicURL(page.canonical ?? defaults.canonical, base, true) ??
    publicURL(path, base, true) ??
    base;
  const robots = { ...defaults.robots, ...page.robots };
  const locale = page.locale ?? defaults.locale ?? site.locale.default;
  const ogTitle =
    page.openGraph?.title ??
    (page.title !== undefined ? title : (defaults.openGraph?.title ?? title));
  const ogDescription =
    page.openGraph?.description ??
    page.description ??
    defaults.openGraph?.description ??
    description;
  const ogImage =
    page.openGraph?.image ?? page.image ?? defaults.openGraph?.image ?? defaults.image;
  const twitterImage =
    page.twitter?.image ??
    page.openGraph?.image ??
    page.image ??
    defaults.twitter?.image ??
    ogImage;
  const ogType =
    page.openGraph?.type ?? (page.article ? 'article' : (defaults.openGraph?.type ?? 'website'));
  const meta: (
    | { key: string; name: string; content: string }
    | { key: string; property: string; content: string }
  )[] = [];
  const add = (key: string, value: string | number | undefined, property = false, id = key) => {
    if (value !== undefined)
      meta.push(
        property
          ? { key: id, property: key, content: String(value) }
          : { key: id, name: key, content: String(value) },
      );
  };
  add('description', description);
  add(
    'robots',
    `${robots.index === false ? 'noindex' : 'index'}, ${robots.follow === false ? 'nofollow' : 'follow'}`,
  );
  add('keywords', (page.keywords ?? defaults.keywords)?.join(', '));
  add('og:title', ogTitle, true);
  add('og:description', ogDescription, true);
  add('og:type', ogType, true);
  add('og:url', canonical, true);
  add('og:site_name', defaults.siteName ?? site.name, true);
  add('og:locale', locale.replace(/-/g, '_'), true);
  for (const alternate of new Set(page.alternateLocales ?? defaults.alternateLocales ?? [])) {
    if (alternate !== locale)
      add('og:locale:alternate', alternate.replace(/-/g, '_'), true, `og:locale:${alternate}`);
  }
  const image = (prefix: 'og' | 'twitter', media?: DeepReadonly<ImageMedia>) => {
    const src = publicURL(media?.src, base);
    if (!src || !media) return;
    add(`${prefix}:image`, src, prefix === 'og');
    add(`${prefix}:image:alt`, media.decorative ? '' : media.alt, prefix === 'og');
    if (prefix === 'og') {
      add('og:image:width', media.width, true);
      add('og:image:height', media.height, true);
    }
  };
  image('og', ogImage);
  image('twitter', twitterImage);
  add(
    'twitter:card',
    page.twitter?.card ??
      defaults.twitter?.card ??
      (twitterImage ? 'summary_large_image' : 'summary'),
  );
  add(
    'twitter:title',
    page.twitter?.title ??
      page.openGraph?.title ??
      (page.title !== undefined ? title : (defaults.twitter?.title ?? ogTitle)),
  );
  add(
    'twitter:description',
    page.twitter?.description ??
      page.openGraph?.description ??
      page.description ??
      defaults.twitter?.description ??
      ogDescription,
  );
  add('twitter:site', page.twitter?.site ?? defaults.twitter?.site);
  add('twitter:creator', page.twitter?.creator ?? defaults.twitter?.creator);
  if (ogType === 'article') {
    const article = { ...defaults.article, ...page.article };
    add('article:published_time', article.publishedAt, true);
    add('article:modified_time', article.modifiedAt, true);
    add('article:section', article.section, true);
    article.authors?.forEach((author, index) => {
      add('author', author.name, false, `author:${index}`);
      add('article:author', publicURL(author.url, base), true, `article:author:${index}`);
    });
    article.tags?.forEach((tag, index) => add('article:tag', tag, true, `article:tag:${index}`));
  }
  const link: (
    | { key: string; rel: 'canonical'; href: string }
    | { key: string; rel: 'alternate'; href: string; hreflang: string }
  )[] = [{ key: 'canonical', rel: 'canonical', href: canonical }];
  for (const alternate of page.alternateLanguages ?? defaults.alternateLanguages ?? []) {
    const href = publicURL(alternate.href, base, true);
    if (href)
      link.push({
        key: `alternate:${alternate.hreflang}`,
        rel: 'alternate',
        hreflang: alternate.hreflang,
        href,
      });
  }
  return { title, titleTemplate: null, htmlAttrs: { lang: locale }, meta, link };
}
