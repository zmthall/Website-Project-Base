import { resources } from '../../../../../shared/data/management';
import { managedRepository, managedResource } from '../../../../utils/management-api';
import { validateManagedFields } from '../../../../utils/management-validation';
import {
  blogStore,
  blogMutation,
} from '../../../../../feature-layers/blog/server/utils/blog-store';
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
    : managedRepository(kind).save(fields);
});
