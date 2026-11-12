import type { SiteFeatures } from '../types/site';

/** Register public routes here as feature screens are implemented. */
export const featureRoutes = {
  '/admin': 'auth',
  '/customer': 'customer',
  '/blog': 'blog',
  '/events': 'events',
  '/appointments': 'appointments',
  '/estimates': 'estimates',
  '/reviews': 'reviews',
  '/newsletter': 'newsletter',
  '/careers': 'careers',
  '/contact': 'contact',
} as const satisfies Record<string, keyof SiteFeatures>;

export function isFeatureEnabled(features: SiteFeatures | undefined, feature: keyof SiteFeatures) {
  if (feature === 'auth' || feature === 'customer')
    return ['firebase', 'supabase', 'local'].includes(String(features?.[feature]));
  return features?.[feature] === true;
}

export function isFeaturePathEnabled(features: SiteFeatures | undefined, path: string) {
  const clean = path.split(/[?#]/)[0]!;
  const match = Object.entries(featureRoutes).find(
    ([prefix]) => clean === prefix || clean.startsWith(`${prefix}/`),
  );
  return !match || isFeatureEnabled(features, match[1]);
}
