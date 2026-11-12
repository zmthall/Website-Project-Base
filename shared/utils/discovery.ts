export interface SitemapEntry {
  path: string;
  modifiedAt?: string;
  index?: boolean;
}
const escapeXML = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!,
  );
export function sitemapXML(origin: string, entries: SitemapEntry[]): string {
  const base = new URL(origin);
  if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password)
    throw new Error('Invalid site origin');
  const urls = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    if (entry.index === false || !entry.path.startsWith('/') || entry.path.startsWith('//'))
      continue;
    const url = new URL(entry.path, base);
    if (url.origin !== base.origin) continue;
    url.search = '';
    url.hash = '';
    urls.set(url.href, entry);
  }
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    [...urls]
      .map(
        ([url, entry]) =>
          `<url><loc>${escapeXML(url)}</loc>${entry.modifiedAt && Number.isFinite(Date.parse(entry.modifiedAt)) ? `<lastmod>${new Date(entry.modifiedAt).toISOString()}</lastmod>` : ''}</url>`,
      )
      .join('') +
    '</urlset>'
  );
}
export function indexingAllowed(enabled: unknown, origin: string): boolean {
  const host = new URL(origin).hostname;
  return (
    (enabled === true || enabled === 'true') &&
    !['localhost', '127.0.0.1', 'example.com', 'www.example.com'].includes(host)
  );
}
export function robotsText(origin: string, enabled: boolean): string {
  return enabled
    ? `User-agent: *\nAllow: /\nDisallow: /showcase\nDisallow: /api/\nDisallow: /account\nDisallow: /admin\nDisallow: /customer\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`
    : 'User-agent: *\nDisallow: /\n';
}
