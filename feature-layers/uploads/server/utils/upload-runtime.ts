import { createError, type H3Event } from 'h3';
import { site } from '../../../../shared/data/site';
import { isFeatureEnabled } from '../../../../shared/utils/features';
import { requireCustomer, requireCustomerCsrf } from '../../../customer/server/utils/customer-auth';
import { LocalUploadStore, UploadStoreError } from './upload-store';

let instance: LocalUploadStore | undefined;

export function uploadStore() {
  return (instance ??= new LocalUploadStore({
    directory: process.env.NUXT_UPLOAD_STORAGE_DIRECTORY || '.data/uploads/objects',
    database: process.env.NUXT_UPLOAD_STORAGE_DATABASE || '.data/uploads.sqlite',
  }));
}

export function requireUploadOwner(event: H3Event, mutation = false) {
  if (!isFeatureEnabled(site.features, 'uploads')) throw createError({ statusCode: 404 });
  const owner = requireCustomer(event).session!.account.id;
  if (mutation) requireCustomerCsrf(event);
  return owner;
}

export function uploadError(error: unknown): never {
  if (error instanceof UploadStoreError)
    throw createError({ statusCode: error.statusCode, statusMessage: error.message });
  throw error;
}
