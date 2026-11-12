// TODO [SEO-01]: Build sitemap entries from all authoritative published records and validate canonical origin/schema; omit drafts, samples, expired/private paths and unsupported detail routes. See docs/integration-audit.md.
import { zonedInstant } from '#shared/utils/scheduling';
import type { ManagedRecord } from '#shared/types/management';
import type { StructuredDataInput } from '../../types/structured-data';
/** Missing structured location data suppresses schema, not the visible event. */
export function publishedEventSchemas(records: ManagedRecord[]): StructuredDataInput[] {
  return records.flatMap((record) => {
    const f = record.fields;
    if (f.status !== 'published') return [];
    let startDate: string | undefined;
    let endDate: string | undefined;
    try {
      startDate = zonedInstant(String(f.date), String(f.startTime), String(f.timeZone));
      endDate = zonedInstant(String(f.date), String(f.endTime), String(f.timeZone));
    } catch {
      return [];
    }
    if (!startDate || !endDate) return [];
    let location: Extract<StructuredDataInput, { kind: 'event' }>['location'];
    if (typeof f.onlineUrl === 'string' && /^https:\/\//.test(f.onlineUrl)) {
      try {
        const url = new URL(f.onlineUrl);
        if (url.username || url.password) return [];
        location = { url: url.href };
      } catch {
        return [];
      }
    } else if (
      f.street &&
      f.city &&
      typeof f.countryCode === 'string' &&
      /^[A-Z]{2}$/.test(f.countryCode)
    )
      location = {
        name: String(f.location),
        address: {
          line1: String(f.street),
          locality: String(f.city),
          region: String(f.region || ''),
          postalCode: String(f.postalCode || ''),
          countryCode: f.countryCode,
        },
      };
    else return [];
    return [
      {
        kind: 'event' as const,
        id: record.id,
        path: '/events',
        name: String(f.title),
        description: String(f.description),
        startDate,
        endDate,
        location,
      },
    ];
  });
}
