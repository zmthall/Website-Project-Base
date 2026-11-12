import type { DeepReadonly } from 'vue';
import type { Address, Business } from '../../shared/types/business';

/** Neutral one-line display, not a country-specific mailing label formatter. */
export function formatBusinessAddress(address?: DeepReadonly<Address>): string {
  if (!address) return '';
  return [
    address.line1,
    address.line2,
    address.locality,
    [address.region, address.postalCode].filter(Boolean).join(' '),
    address.countryCode,
  ]
    .filter(Boolean)
    .join(', ');
}

export function resolveBusiness(business: DeepReadonly<Business>, locationId?: string) {
  const locations = business.locations ?? [];
  const primaryLocation = locations.find((location) => location.primary) ?? locations[0];
  // An invalid explicit ID must not silently select an unrelated location.
  const location =
    locationId === undefined
      ? primaryLocation
      : locations.find((candidate) => candidate.id === locationId);
  const contact = {
    phone: location?.contact?.phone ?? business.contact?.phone,
    email: location?.contact?.email ?? business.contact?.email,
    fax: location?.contact?.fax ?? business.contact?.fax,
  };
  return {
    name: business.name,
    legalName: business.legalName ?? business.name,
    logo: business.logo,
    logoCompact: business.logoCompact ?? business.logo,
    locations,
    primaryLocation,
    location,
    contact,
    address: formatBusinessAddress(location?.address),
    hours: location?.hours,
    timezone: location?.timezone,
    socials: business.socials ?? [],
    serviceAreas: location?.serviceAreas ?? business.serviceAreas ?? [],
    rating: location?.rating ?? business.rating,
  };
}
