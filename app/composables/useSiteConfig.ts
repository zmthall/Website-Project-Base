import { readonly, type DeepReadonly } from 'vue';
import { site } from '#shared/data/site';
import type { SiteConfig } from '../../shared/types/site';

/** Canonical, read-only access to static site content. Never stores request state. */
export function useSiteConfig(): DeepReadonly<SiteConfig> {
  return readonly(site as SiteConfig);
}
