// TODO [ADMIN-01]: Add durable audit events and least-privilege roles for content edits/deletes, applicant/message access and auth policy changes; add retention/export actions where appropriate. See docs/integration-audit.md.
import { managedRepository, managedResource } from '../../../../utils/management-api';
import {
  blogStore,
  blogMutation,
} from '../../../../../feature-layers/blog/server/utils/blog-store';
import { boundedJson } from '../../../../utils/bounded-body';
export default defineEventHandler(async (event) => {
  const kind = managedResource(event);
  const body = await boundedJson(event);
  if (typeof body.version !== 'string')
    throw createError({ statusCode: 400, statusMessage: 'Record version required' });
  const id = getRouterParam(event, 'id')!;
  if (kind === 'blog') await blogMutation(() => blogStore().remove(id, body.version as string));
  else await managedRepository(kind).remove(id, body.version);
  setResponseStatus(event, 204);
});
