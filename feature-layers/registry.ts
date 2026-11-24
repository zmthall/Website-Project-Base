import appointments from './appointments/feature';
import administrator from './administrator/feature';
import blog from './blog/feature';
import careers from './careers/feature';
import contact from './contact/feature';
import customer from './customer/feature';
import estimates from './estimates/feature';
import events from './events/feature';
import newsletter from './newsletter/feature';
import payments from './payments/feature';
import products from './products/feature';
import reviews from './reviews/feature';
import search from './search/feature';
import uploads from './uploads/feature';
import type { FeatureDefinition, FeatureKey } from './definition';

/** Installed feature layers. Adding a feature requires one manifest and one entry here. */
export const featureDefinitions = [
  appointments,
  administrator,
  blog,
  careers,
  contact,
  customer,
  estimates,
  events,
  newsletter,
  payments,
  products,
  reviews,
  search,
  uploads,
] as const satisfies readonly FeatureDefinition[];

export function validateFeatureDefinitions(definitions: readonly FeatureDefinition[]): void {
  const keys = new Set<FeatureKey>();
  const routes = new Set<string>();
  for (const definition of definitions) {
    if (keys.has(definition.key)) throw new Error(`Duplicate feature key: ${definition.key}`);
    keys.add(definition.key);
    for (const route of definition.routes) {
      if (routes.has(route)) throw new Error(`Duplicate feature route: ${route}`);
      routes.add(route);
    }
  }
  for (const definition of definitions) {
    for (const dependency of definition.dependencies) {
      if (!keys.has(dependency)) {
        throw new Error(`Unknown feature dependency: ${definition.key} -> ${dependency}`);
      }
    }
  }
}

validateFeatureDefinitions(featureDefinitions);

export const featureLayerPaths = featureDefinitions.map(({ key }) => `./feature-layers/${key}`);

export const featureRoutes = Object.fromEntries(
  featureDefinitions.flatMap(({ key, routes }) => routes.map((route) => [route, key])),
) as Readonly<Record<string, FeatureKey>>;

export const featureDefinitionByKey = Object.fromEntries(
  featureDefinitions.map((definition) => [definition.key, definition]),
) as Readonly<Record<FeatureKey, FeatureDefinition>>;

export function getFeatureDefinition(key: string): FeatureDefinition | undefined {
  return featureDefinitionByKey[key as FeatureKey];
}