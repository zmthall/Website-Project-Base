import type { SiteFeatures } from '../types/site';
import { featureRoutes } from '../../feature-layers/registry';

export { featureRoutes } from '../../feature-layers/registry';

export function isFeatureEnabled(features: SiteFeatures | undefined, feature: keyof SiteFeatures) {
  if (feature === 'administrator' || feature === 'customer')
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
