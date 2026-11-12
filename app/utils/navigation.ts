import type { DeepReadonly } from 'vue';
import type { Router, RouteLocationRaw, LocationQueryRaw } from 'vue-router';
import type { Action } from '../../shared/types/action';
import type { NavigationItem, NavigationGroup } from '../../shared/types/navigation';

export interface ResolvedAction {
  href?: string;
  to?: RouteLocationRaw;
  target?: string;
  rel?: string;
  download?: string | true;
  disabled: boolean;
}

function internalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !/[\\\s\u0000-\u001f]/.test(value);
}

function webLink(value: string): boolean {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Link attributes only: native links preserve keyboard, download and new-tab behavior. */
export function resolveAction(
  action: DeepReadonly<Action>,
  router: Pick<Router, 'resolve'>,
): ResolvedAction {
  if (action.disabled) return { disabled: true };
  switch (action.type) {
    case 'route': {
      let to: RouteLocationRaw;
      if (typeof action.to === 'string') {
        if (!internalPath(action.to)) return { disabled: true };
        to = action.to;
      } else {
        const query: LocationQueryRaw = {};
        for (const [key, value] of Object.entries(action.to.query ?? {})) {
          const convert = (entry: string | number | boolean | null) =>
            typeof entry === 'boolean' ? String(entry) : entry;
          query[key] = Array.isArray(value)
            ? value.map(convert)
            : convert(value as string | number | boolean | null);
        }
        const params = Object.fromEntries(
          Object.entries(action.to.params ?? {}).map(([key, value]) => [
            key,
            typeof value === 'string' || typeof value === 'number' ? value : [...value],
          ]),
        );
        to = { name: action.to.name, params, query };
      }
      try {
        return { to, href: router.resolve(to).href, disabled: false };
      } catch {
        return { disabled: true };
      }
    }
    case 'external':
      return webLink(action.href)
        ? {
            href: action.href,
            target: action.target,
            rel: action.target === '_blank' ? 'noopener noreferrer' : undefined,
            disabled: false,
          }
        : { disabled: true };
    case 'phone': {
      const phone = action.value.replace(/[().\s-]/g, '');
      return /^\+?\d+$/.test(phone)
        ? { href: `tel:${phone}`, disabled: false }
        : { disabled: true };
    }
    case 'email':
      return /^[^\s@?&#]+@[^\s@?&#]+$/.test(action.value)
        ? {
            href: `mailto:${encodeURIComponent(action.value).replace(/%40/g, '@')}`,
            disabled: false,
          }
        : { disabled: true };
    case 'anchor':
      return /^#[^\s]+$/.test(action.href)
        ? { href: action.href, disabled: false }
        : { disabled: true };
    case 'download':
      return internalPath(action.href) || webLink(action.href)
        ? { href: action.href, download: action.filename ?? true, disabled: false }
        : { disabled: true };
  }
}

export interface ResolvedNavigationItem {
  label: string;
  icon?: string;
  description?: string;
  action?: DeepReadonly<Action>;
  link?: ResolvedAction;
  active: boolean;
  exactActive: boolean;
  children: ResolvedNavigationItem[];
}

/** Explicit order first; ties and unordered items retain source order. */
function ordered<T extends { readonly order?: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
}

export function resolveNavigation(
  items: readonly DeepReadonly<NavigationItem>[],
  router: Pick<Router, 'resolve'>,
  path: string,
  authenticated = false,
): ResolvedNavigationItem[] {
  const normalize = (value: string) => value.replace(/\/+$/, '') || '/';
  const current = normalize(path);
  return ordered(items)
    .filter(
      (item) =>
        !item.visibility ||
        item.visibility === 'always' ||
        (item.visibility === 'authenticated' ? authenticated : !authenticated),
    )
    .flatMap((item) => {
      const children = resolveNavigation(item.children ?? [], router, path, authenticated);
      if (!item.action && children.length === 0) return [];
      const link = item.action ? resolveAction(item.action, router) : undefined;
      const destination = link?.to ? normalize(router.resolve(link.to).path) : undefined;
      const exactActive = destination !== undefined && destination === current;
      const active =
        exactActive ||
        (destination !== undefined &&
          destination !== '/' &&
          current.startsWith(`${destination}/`)) ||
        children.some((child) => child.active);
      return [
        {
          label: item.label,
          icon: item.icon,
          description: item.description,
          action: item.action,
          link,
          children,
          active,
          exactActive,
        },
      ];
    });
}

export function resolveNavigationGroups(
  groups: readonly DeepReadonly<NavigationGroup>[],
  router: Pick<Router, 'resolve'>,
  path: string,
  authenticated = false,
) {
  return ordered(groups)
    .map((group) => ({
      label: group.label,
      description: group.description,
      items: resolveNavigation(group.items, router, path, authenticated),
    }))
    .filter((group) => group.items.length > 0);
}
