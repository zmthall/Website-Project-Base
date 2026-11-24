import type { SiteFeatures } from '../shared/types/site';
import type { ResourceDefinition, ResourceKind } from '../shared/types/management';

export type FeatureKey = keyof SiteFeatures;
export type FeatureConfiguration = 'boolean' | 'provider';
export type FeatureMaturity = 'active' | 'foundation' | 'planned';

export interface FeatureImplementation {
  app?: readonly string[];
  server?: readonly string[];
  shared?: readonly string[];
  tests?: readonly string[];
  docs?: readonly string[];
}

/** Build-time metadata for one self-contained feature layer. */
export interface FeatureDefinition<Key extends FeatureKey = FeatureKey> {
  key: Key;
  name: string;
  description: string;
  configuration: FeatureConfiguration;
  maturity: FeatureMaturity;
  dependencies: readonly FeatureKey[];
  routes: readonly `/${string}`[];
  sitemapRoutes?: readonly `/${string}`[];
  management?: Partial<Record<ResourceKind, ResourceDefinition>>;
  /** Owned implementation paths plus any shared dependencies used by the feature. */
  implementation: FeatureImplementation;
}

export function defineFeature<const Key extends FeatureKey>(
  definition: FeatureDefinition<Key>,
): FeatureDefinition<Key> {
  return definition;
}
