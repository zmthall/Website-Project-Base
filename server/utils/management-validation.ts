// TODO [API-02]: Add shared runtime request schemas, route-specific size/rate limits and redacted provider error translation; TypeScript request casts are not runtime validation. See docs/integration-audit.md.
import { createError } from 'h3';
import { resources } from '../../shared/data/management';
import type { ManagedValue, ResourceKind } from '../../shared/types/management';
export function validateManagedFields(
  kind: ResourceKind,
  input: unknown,
): Record<string, ManagedValue> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({ statusCode: 400, statusMessage: 'Invalid fields' });
  const source = input as Record<string, unknown>;
  const fields: Record<string, ManagedValue> = {};
  for (const spec of resources[kind].fields) {
    const value = source[spec.key] ?? (spec.type === 'checkbox' ? false : '');
    if (spec.type === 'checkbox') {
      if (typeof value !== 'boolean')
        throw createError({ statusCode: 400, statusMessage: `Invalid ${spec.label}` });
      fields[spec.key] = value;
      continue;
    }
    if (spec.type === 'number') {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5)
        throw createError({ statusCode: 400, statusMessage: 'Rating must be between 1 and 5' });
      fields[spec.key] = value;
      continue;
    }
    if (
      typeof value !== 'string' ||
      value.length > (spec.key === 'content' ? 100000 : spec.type === 'textarea' ? 10000 : 1000)
    )
      throw createError({ statusCode: 400, statusMessage: `Invalid ${spec.label}` });
    const normalized = value.trim();
    if (spec.required && !normalized)
      throw createError({ statusCode: 400, statusMessage: `${spec.label} is required` });
    if (spec.options && !spec.options.includes(normalized))
      throw createError({ statusCode: 400, statusMessage: `Invalid ${spec.label}` });
    if (spec.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
      throw createError({ statusCode: 400, statusMessage: 'Invalid email address' });
    if (
      spec.key === 'slug' &&
      (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) || normalized.length > 100)
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'Use lowercase letters, numbers, and hyphens for the slug',
      });
    if (
      ['thumbnail', 'seoImage', 'canonicalUrl'].includes(spec.key) &&
      normalized &&
      !/^\/images\/[a-zA-Z0-9/_ .-]+$/.test(normalized)
    ) {
      let url;
      try {
        url = new URL(normalized);
      } catch {
        throw createError({ statusCode: 400, statusMessage: 'Invalid image URL' });
      }
      if (url.protocol !== 'https:' || url.username || url.password)
        throw createError({ statusCode: 400, statusMessage: 'Image URLs must use HTTPS' });
    }
    if (spec.type === 'datetime-local' && normalized) {
      if (!/(Z|[+-]\d\d:\d\d)$/.test(normalized) || !Number.isFinite(Date.parse(normalized)))
        throw createError({
          statusCode: 400,
          statusMessage: 'Publication date must include a timezone',
        });
      fields[spec.key] = new Date(normalized).toISOString();
    } else fields[spec.key] = normalized;
  }
  if (kind === 'events') {
    const date = String(fields.date);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date + 'T00:00:00Z')) ||
      new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date ||
      !/^\d{2}:\d{2}$/.test(String(fields.startTime)) ||
      !/^\d{2}:\d{2}$/.test(String(fields.endTime))
    )
      throw createError({ statusCode: 400, statusMessage: 'Invalid event date or time' });
    const validTime = (time: string) => Number(time.slice(0, 2)) < 24 && Number(time.slice(3)) < 60;
    if (
      !validTime(String(fields.startTime)) ||
      !validTime(String(fields.endTime)) ||
      String(fields.endTime) <= String(fields.startTime)
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'End time must be after start time on the event date',
      });
    try {
      new Intl.DateTimeFormat('en', { timeZone: String(fields.timeZone) });
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Invalid timezone' });
    }
  }
  if (
    ['blog', 'newsletters'].includes(kind) &&
    fields.status === 'published' &&
    !fields.publishedAt
  )
    fields.publishedAt = new Date().toISOString();
  return fields;
}
export function recordIsPublic(fields: Record<string, ManagedValue>, now = Date.now()) {
  return (
    fields.status === 'published' &&
    Boolean(fields.publishedAt) &&
    Date.parse(String(fields.publishedAt)) <= now
  );
}
