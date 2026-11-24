import { getRouterParam, send, setHeader } from 'h3';
import { requireUploadOwner, uploadStore } from '../../../utils/upload-runtime';

export default defineEventHandler((event) => {
  const owner = requireUploadOwner(event);
  const result = uploadStore().read(owner, getRouterParam(event, 'id') || '');
  if (!result) throw createError({ statusCode: 404 });
  const filename = encodeURIComponent(result.metadata.name);
  setHeader(event, 'Content-Type', result.metadata.mimeType);
  setHeader(event, 'Content-Length', result.bytes.length);
  setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
  setHeader(event, 'X-Content-Type-Options', 'nosniff');
  return send(event, result.bytes);
});
