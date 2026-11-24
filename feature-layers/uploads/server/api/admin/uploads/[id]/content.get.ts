import { getRouterParam, send, setHeader } from 'h3';
import { requireAdmin } from '../../../../../../administrator/server/utils/admin-auth';
import { uploadStore } from '../../../../utils/upload-runtime';

export default defineEventHandler((event) => {
  requireAdmin(event);
  const result = uploadStore().readClaimed(getRouterParam(event, 'id') || '');
  if (!result) throw createError({ statusCode: 404 });
  const filename = encodeURIComponent(result.metadata.name);
  setHeader(event, 'Content-Type', result.metadata.mimeType);
  setHeader(event, 'Content-Length', result.bytes.length);
  setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
  setHeader(event, 'X-Content-Type-Options', 'nosniff');
  return send(event, result.bytes);
});
