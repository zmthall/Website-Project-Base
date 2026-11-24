// TODO [ADMIN-01]: Add durable audit events and least-privilege roles for content edits/deletes, applicant/message access and auth policy changes; add retention/export actions where appropriate. See docs/integration-audit.md.
import { managedRepository, managedResource } from '../../../../utils/management-api';
import { validateManagedFields } from '../../../../utils/management-validation';
import {
  blogStore,
  blogMutation,
} from '../../../../../feature-layers/blog/server/utils/blog-store';
import { boundedJson } from '../../../../utils/bounded-body';
import { resources } from '../../../../../shared/data/management';
export default defineEventHandler(async (event) => {
  const kind = managedResource(event);
  const id = getRouterParam(event, 'id')!;
  const body = await boundedJson(event);
  if (typeof body.version !== 'string')
    throw createError({ statusCode: 400, statusMessage: 'Record version required' });
  const fields = validateManagedFields(kind, body.fields);
  const editableFields = resources[kind].editableFields;
  const repository = managedRepository(kind);
  if (editableFields) {
    const previous = await repository.get(id);
    if (!previous) throw createError({ statusCode: 404 });
    // Keep original submission/consent evidence immutable; only declared workflow fields may change.
    return repository.save(
      {
        ...previous.fields,
        ...Object.fromEntries(editableFields.map((key) => [key, fields[key]!])),
      },
      id,
      body.version,
    );
  }
  return kind === 'blog'
    ? blogMutation(() => blogStore().save(fields, id, body.version as string))
    : repository.save(fields, id, body.version);
});
