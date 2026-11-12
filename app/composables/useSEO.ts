import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useHead, useRoute } from '#imports';
import type { SEO } from '../../shared/types/seo';
import { resolveSEO } from '../utils/seo';
import { useSiteConfig } from './useSiteConfig';

/** Call in setup. A getter/ref keeps async page metadata and route changes reactive. */
export function useSEO(page: MaybeRefOrGetter<SEO | undefined> = {}) {
  const site = useSiteConfig();
  const route = useRoute();
  const head = computed(() => resolveSEO(site, toValue(page) ?? {}, route.path));
  useHead(() => head.value);
  return head;
}
