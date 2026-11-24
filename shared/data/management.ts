import type { ResourceDefinition, ResourceKind } from '../types/management';
import { featureDefinitions } from '../../feature-layers/registry';
import { isFeatureEnabled } from '../utils/features';
import type { SiteFeatures } from '../types/site';
import { sharedContentResources } from './content-management';

const featureResources = Object.assign(
  { ...sharedContentResources },
  ...featureDefinitions.map(({ management }) => management ?? {}),
);

export const resources = featureResources as Record<ResourceKind, ResourceDefinition>;
export const resourceKinds = Object.keys(resources) as ResourceKind[];

export function resourceIsEnabled(kind: ResourceKind, features: SiteFeatures | undefined) {
  const feature = resources[kind].feature as keyof SiteFeatures | undefined;
  return !feature || isFeatureEnabled(features, feature);
}

export function resourceAdminPath(kind: ResourceKind) {
  return `/admin/${kind}`;
}
