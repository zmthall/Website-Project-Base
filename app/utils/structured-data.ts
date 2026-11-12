import type { DeepReadonly } from 'vue';
import type { SiteConfig } from '../../shared/types/site';
import type { Address } from '../../shared/types/business';
import type { JsonLDNode, StructuredDataInput } from '../types/structured-data';

function url(path: string, origin: string): string | undefined {
  try {
    const value = new URL(path, origin);
    return ['https:', 'http:'].includes(value.protocol) ? value.href : undefined;
  } catch {
    return undefined;
  }
}
function address(value?: DeepReadonly<Address>) {
  return value
    ? {
        '@type': 'PostalAddress',
        streetAddress: [value.line1, value.line2].filter(Boolean).join(', '),
        addressLocality: value.locality,
        addressRegion: value.region,
        postalCode: value.postalCode,
        addressCountry: value.countryCode,
      }
    : undefined;
}
/** Only pass published content represented on the current page. Ratings are never inferred. */
export function structuredDataNodes(
  site: DeepReadonly<SiteConfig>,
  inputs: DeepReadonly<StructuredDataInput[]>,
): JsonLDNode[] {
  const origin = new URL(site.url).origin;
  const organization = `${origin}/#organization`;
  const nodes = inputs.map((input): JsonLDNode => {
    switch (input.kind) {
      case 'organization':
        return {
          '@type': 'Organization',
          '@id': organization,
          name: site.business.name,
          legalName: site.business.legalName,
          url: origin,
          logo: site.business.logo ? url(site.business.logo.src, origin) : undefined,
          telephone: site.business.contact?.phone,
          email: site.business.contact?.email,
        };
      case 'website':
        return {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          name: site.name,
          url: origin,
          inLanguage: site.locale.default,
          publisher: { '@id': organization },
        };
      case 'location':
        return {
          '@type': 'LocalBusiness',
          '@id': `${origin}/#location-${encodeURIComponent(input.location.id)}`,
          name: input.location.name,
          parentOrganization: { '@id': organization },
          address: address(input.location.address),
          telephone: input.location.contact?.phone,
          openingHoursSpecification: input.location.hours?.regular.flatMap((day) =>
            day.periods.map((period) => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: `https://schema.org/${day.day[0]!.toUpperCase()}${day.day.slice(1)}`,
              opens: period.opens,
              closes: period.closes,
            })),
          ),
        };
      case 'breadcrumbs':
        return {
          '@type': 'BreadcrumbList',
          '@id': `${origin}/#breadcrumbs`,
          itemListElement: input.items
            .filter((item) => url(item.path, origin))
            .map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: item.name,
              item: url(item.path, origin),
            })),
        };
      case 'service':
        return {
          '@type': 'Service',
          '@id': `${url(input.path, origin)}#service`,
          name: input.service.name,
          description: input.service.description ?? input.service.summary,
          url: url(input.path, origin),
          provider: { '@id': organization },
          image: input.service.image ? url(input.service.image.src, origin) : undefined,
        };
      case 'article':
        return {
          '@type': 'Article',
          '@id': `${url(input.path, origin)}#article`,
          headline: input.article.title,
          description: input.article.excerpt,
          datePublished: input.article.publishedAt,
          dateModified: input.article.modifiedAt,
          mainEntityOfPage: url(input.path, origin),
          image: input.article.image ? url(input.article.image.src, origin) : undefined,
          author: input.article.author
            ? { '@type': 'Person', name: input.article.author.name }
            : undefined,
          publisher: { '@id': organization },
        };
      case 'faq':
        return {
          '@type': 'FAQPage',
          '@id': `${url(input.path, origin)}#faq`,
          mainEntity: input.items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        };
      case 'event':
        return {
          '@type': 'Event',
          '@id': `${url(input.path, origin)}#event${input.id ? '-' + encodeURIComponent(input.id) : ''}`,
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          url: url(input.path, origin),
          organizer: { '@id': organization },
          location:
            'url' in input.location
              ? { '@type': 'VirtualLocation', url: url(input.location.url, origin) }
              : {
                  '@type': 'Place',
                  name: input.location.name,
                  address: address(input.location.address),
                },
        };
      case 'job':
        return {
          '@type': 'JobPosting',
          '@id': `${url(input.path, origin)}#job`,
          title: input.title,
          description: input.description,
          datePosted: input.datePosted,
          validThrough: input.validThrough,
          employmentType: input.employmentType,
          hiringOrganization: { '@id': organization },
          jobLocation: { '@type': 'Place', address: address(input.address) },
          url: url(input.path, origin),
        };
    }
  });
  return [...new Map(nodes.map((node) => [node['@id'], node])).values()];
}
export function serializeStructuredData(nodes: JsonLDNode[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
