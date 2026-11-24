import { getRouterParam } from 'h3';
import { requireUploadOwner, uploadError, uploadStore } from '../../../utils/upload-runtime';

export default defineEventHandler((event) => {
  const owner = requireUploadOwner(event, true);
  try {
    return uploadStore().complete(owner, getRouterParam(event, 'id') || '');
  } catch (error) {
    uploadError(error);
  }
});
