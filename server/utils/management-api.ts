import { createError, getRouterParam, getQuery, type H3Event } from 'h3';
import { resources, resourceKinds } from '../../shared/data/management';
import { site } from '../../shared/data/site';
import { isFeatureEnabled } from '../../shared/utils/features';
import type { ResourceKind, ManagedRecord, ManagedPage } from '../../shared/types/management';
import type { SiteFeatures } from '../../shared/types/site';
import { managementStore } from './management-store';
import { blogStore } from './blog-store';
export function managedResource(event: H3Event): ResourceKind {
  const value = getRouterParam(event, 'resource') as ResourceKind;
  if (
    !resourceKinds.includes(value) ||
    !isFeatureEnabled(site.features, resources[value].feature as keyof SiteFeatures)
  )
    throw createError({ statusCode: 404, statusMessage: 'Feature not available' });
  return value;
}
export async function managedRecords(kind: ResourceKind) {
  return kind === 'blog' ? blogStore().list() : managementStore().list(kind);
}
export function paginateRecords(event: H3Event, records: ManagedRecord[]): ManagedPage {
  const query = getQuery(event);
  const page = Math.max(1, Math.floor(Number(query.page) || 1));
  const pageSize = Math.min(50, Math.max(1, Math.floor(Number(query.pageSize) || 20)));
  const search = String(query.search || '')
    .toLowerCase()
    .slice(0, 200);
  const status = String(query.status || '');
  const filtered = records.filter(
    (record) =>
      (!status || record.fields.status === status) &&
      (!search ||
        Object.values(record.fields).some((value) => String(value).toLowerCase().includes(search))),
  );
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}
