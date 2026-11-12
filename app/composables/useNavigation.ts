import { isFeaturePathEnabled } from '#shared/utils/features';
import type { ResolvedNavigationItem } from '../utils/navigation';
import { computed, toValue, type DeepReadonly, type MaybeRefOrGetter } from 'vue';
import { useRoute, useRouter } from '#app';
import { headerAction, footerAction } from '#shared/data/navigation';
import type { Action } from '../../shared/types/action';
import { resolveAction, resolveNavigation, resolveNavigationGroups } from '../utils/navigation';
import { useSiteConfig } from './useSiteConfig';

/** Authentication is injected by the caller; menu visibility is not authorization. */
export function useNavigation(authenticated: MaybeRefOrGetter<boolean> = false) {
  const site = useSiteConfig();
  const route = useRoute();
  const router = useRouter();
  const available = (items: ResolvedNavigationItem[]): ResolvedNavigationItem[] =>
    items
      .filter((item) => !item.link?.href || isFeaturePathEnabled(site.features, item.link.href))
      .map((item) => ({ ...item, children: available(item.children) }))
      .filter((item) => item.action || item.children.length);
  return {
    primary: computed(() =>
      available(
        resolveNavigation(site.navigation.primary, router, route.path, toValue(authenticated)),
      ),
    ),
    footer: computed(() =>
      resolveNavigationGroups(
        site.navigation.footer ?? [],
        router,
        route.path,
        toValue(authenticated),
      )
        .map((group) => ({ ...group, items: available(group.items) }))
        .filter((group) => group.items.length),
    ),
    headerAction: computed(() => ({ ...headerAction, ...resolveAction(headerAction, router) })),
    footerAction: computed(() => ({ ...footerAction, ...resolveAction(footerAction, router) })),
    resolveAction: (action: DeepReadonly<Action>) => resolveAction(action, router),
  };
}
