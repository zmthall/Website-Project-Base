import { getHeader } from 'h3';
import type { UploadRequest } from '../../../app/features/uploads/types';
import { boundedJson } from '../../../../../server/utils/bounded-body';
import { requireUploadOwner, uploadError, uploadStore } from '../../utils/upload-runtime';

export default defineEventHandler(async (event) => {
  const owner = requireUploadOwner(event, true);
  const key = getHeader(event, 'idempotency-key') || '';
  const body = (await boundedJson(event, 10_000)) as unknown as UploadRequest;
  try {
    return uploadStore().initialize(owner, body, key);
  } catch (error) {
    uploadError(error);
  }
});
