// TODO [ADMIN-01]: Add durable audit events and least-privilege roles for content edits/deletes, applicant/message access and auth policy changes; add retention/export actions where appropriate. See docs/integration-audit.md.
import { managedResource } from '../../../../utils/management-api';
import { validateManagedFields } from '../../../../utils/management-validation';
import { managementStore } from '../../../../utils/management-store';
import { blogStore, blogMutation } from '../../../../utils/blog-store';
import { boundedJson } from '../../../../utils/bounded-body';
export default defineEventHandler(async (event) => {
  const kind = managedResource(event);
  const id = getRouterParam(event, 'id')!;
  const body = await boundedJson(event);
  if (typeof body.version !== 'string')
    throw createError({ statusCode: 400, statusMessage: 'Record version required' });
  const fields = validateManagedFields(kind, body.fields);
  if (['messages', 'applications', 'subscribers'].includes(kind)) {
    const previous = managementStore().get(kind, id);
    if (!previous) throw createError({ statusCode: 404 });
    // Keep original submission/consent evidence immutable; only workflow status and notes may change.
    return managementStore().save(
      kind,
      {
        ...previous.fields,
        status: fields.status!,
        ...(['messages', 'applications'].includes(kind) ? { notes: fields.notes! } : {}),
      },
      id,
      body.version,
    );
  }
  return kind === 'blog'
    ? blogMutation(() => blogStore().save(fields, id, body.version as string))
    : managementStore().save(kind, fields, id, body.version);
});
