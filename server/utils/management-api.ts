import { createError, getRouterParam, getQuery, type H3Event } from 'h3';
import { resourceIsEnabled, resourceKinds } from '../../shared/data/management';
import { site } from '../../shared/data/site';
import type { ResourceKind, ManagedRecord, ManagedPage } from '../../shared/types/management';
import { managementStore } from './management-store';
import { blogStore } from '../../feature-layers/blog/server/utils/blog-store';
import { eventRepository } from '../../feature-layers/events/server/repositories/events';
import { reviewRepository } from '../../feature-layers/reviews/server/repositories/reviews';
import {
  businessRepository,
  faqRepository,
  mediaRepository,
  ratingRepository,
} from '../repositories/shared-content';

export const publicContentKinds = [
  'events',
  'reviews',
  'newsletters',
  'jobs',
  'business',
  'faqs',
  'media',
  'ratings',
] as const satisfies readonly ResourceKind[];

export function managedRepository(kind: ResourceKind) {
  if (kind === 'events') return eventRepository;
  if (kind === 'reviews') return reviewRepository;
  if (kind === 'business') return businessRepository;
  if (kind === 'faqs') return faqRepository;
  if (kind === 'media') return mediaRepository;
  if (kind === 'ratings') return ratingRepository;
  const store = managementStore();
  return {
    list: async () => store.list(kind),
    get: async (id: string) => store.get(kind, id),
    save: async (
      fields: Parameters<typeof store.save>[1],
      id?: string,
      version?: string,
    ) => store.save(kind, fields, id, version),
    remove: async (id: string, version: string) => store.remove(kind, id, version),
  };
}

export function managedResource(event: H3Event): ResourceKind {
  const value = getRouterParam(event, 'resource') as ResourceKind;
  if (
    !resourceKinds.includes(value) || !resourceIsEnabled(value, site.features)
  )
    throw createError({ statusCode: 404, statusMessage: 'Feature not available' });
  return value;
}
export async function managedRecords(kind: ResourceKind) {
  return kind === 'blog' ? blogStore().list() : managedRepository(kind).list();
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
