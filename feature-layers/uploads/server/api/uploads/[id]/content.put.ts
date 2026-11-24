import { getHeader, getRouterParam, readRawBody } from 'h3';
import { requireUploadOwner, uploadError, uploadStore } from '../../../utils/upload-runtime';

export default defineEventHandler(async (event) => {
  const owner = requireUploadOwner(event, true);
  const declaredLength = Number(getHeader(event, 'content-length') || 0);
  if (
    !Number.isSafeInteger(declaredLength) ||
    declaredLength <= 0 ||
    declaredLength > 5 * 1024 * 1024
  )
    throw createError({ statusCode: 413, statusMessage: 'Invalid upload size' });
  const bytes = await readRawBody(event, false);
  if (!bytes || bytes.length !== declaredLength)
    throw createError({ statusCode: 400, statusMessage: 'Incomplete upload content' });
  try {
    uploadStore().putContent(owner, getRouterParam(event, 'id') || '', bytes);
    return { uploaded: true };
  } catch (error) {
    uploadError(error);
  }
});
