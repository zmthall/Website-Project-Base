import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useSiteConfig } from './useSiteConfig';
import type { SiteFeatures } from '../../shared/types/site';
import { isFeatureEnabled } from '#shared/utils/features';

/** Shared switch for optional feature UI. Omitted flags are disabled. */
export function useFeature(feature: MaybeRefOrGetter<keyof SiteFeatures>) {
  const site = useSiteConfig();
  return computed(() => isFeatureEnabled(site.features, toValue(feature)));
}
