import { getRouterParam } from 'h3';
import { requireUploadOwner, uploadStore } from '../../utils/upload-runtime';

export default defineEventHandler((event) => {
  const owner = requireUploadOwner(event);
  const metadata = uploadStore().status(owner, getRouterParam(event, 'id') || '');
  if (!metadata) throw createError({ statusCode: 404 });
  return metadata;
});
