import { getRouterParam, setResponseStatus } from 'h3';
import { requireUploadOwner, uploadError, uploadStore } from '../../utils/upload-runtime';

export default defineEventHandler((event) => {
  const owner = requireUploadOwner(event, true);
  try {
    if (!uploadStore().remove(owner, getRouterParam(event, 'id') || ''))
      throw createError({ statusCode: 404 });
    setResponseStatus(event, 204);
    return null;
  } catch (error) {
    uploadError(error);
  }
});
