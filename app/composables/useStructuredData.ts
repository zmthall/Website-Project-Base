import { computed, toValue, type MaybeRefOrGetter, type DeepReadonly } from 'vue';
import type { StructuredDataInput } from '../types/structured-data';
import { structuredDataNodes, serializeStructuredData } from '../utils/structured-data';
/** Stable head keys replace reactive data and remove page schemas on navigation. */
export function useStructuredData(
  inputs: MaybeRefOrGetter<DeepReadonly<StructuredDataInput[]>>,
  key = 'page',
) {
  const site = useSiteConfig();
  const nodes = computed(() => structuredDataNodes(site, toValue(inputs)));
  useHead(() => ({
    script: nodes.value.length
      ? [
          {
            key: `schema-${key}`,
            type: 'application/ld+json',
            textContent: serializeStructuredData(nodes.value),
          },
        ]
      : [],
  }));
  return nodes;
}
