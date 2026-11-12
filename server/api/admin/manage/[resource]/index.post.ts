import { resources } from '../../../../../shared/data/management';
import { managedResource } from '../../../../utils/management-api';
import { validateManagedFields } from '../../../../utils/management-validation';
import { managementStore } from '../../../../utils/management-store';
import { blogStore, blogMutation } from '../../../../utils/blog-store';
import { boundedJson } from '../../../../utils/bounded-body';
export default defineEventHandler(async (event) => {
  const kind = managedResource(event);
  if (!resources[kind].canCreate)
    throw createError({
      statusCode: 405,
      statusMessage: 'Records are created through public submissions',
    });
  const body = await boundedJson(event);
  const fields = validateManagedFields(kind, body.fields);
  return kind === 'blog'
    ? blogMutation(() => blogStore().save(fields))
    : managementStore().save(kind, fields);
});
