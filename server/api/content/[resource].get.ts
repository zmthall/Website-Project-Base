// TODO [REV-01]: Add audited moderation, abuse/duplicate handling and verified external-provider import; expose only public fields and consistent aggregates. See docs/integration-audit.md.
import { managedResource } from '../../utils/management-api';
import { managementStore } from '../../utils/management-store';
import { recordIsPublic } from '../../utils/management-validation';
import { renderMarkdown } from '../../utils/markdown';
export default defineEventHandler((event) => {
  const kind = managedResource(event);
  if (!['events', 'reviews', 'newsletters', 'jobs'].includes(kind))
    throw createError({ statusCode: 404 });
  const records = managementStore()
    .list(kind)
    .filter((record) =>
      kind === 'newsletters'
        ? recordIsPublic(record.fields)
        : record.fields.status === (kind === 'jobs' ? 'open' : 'published'),
    );
  return records
    .map((record) => {
      const { notes: _notes, ...fields } = record.fields;
      return {
        ...record,
        fields,
        ...(kind === 'newsletters' ? renderMarkdown(String(fields.content)) : {}),
      };
    })
    .sort((a, b) =>
      String(b.fields.publishedAt || b.createdAt).localeCompare(
        String(a.fields.publishedAt || a.createdAt),
      ),
    );
});
