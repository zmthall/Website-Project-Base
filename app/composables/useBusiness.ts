import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { resolveBusiness } from '../utils/business';
import { useSiteConfig } from './useSiteConfig';

/** A computed display model; omitted location selects primary, then first. */
export function useBusiness(locationId?: MaybeRefOrGetter<string | undefined>) {
  const site = useSiteConfig();
  return computed(() => resolveBusiness(site.business, toValue(locationId)));
}
