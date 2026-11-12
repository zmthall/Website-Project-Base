// TODO [API-02]: Add shared runtime request schemas, route-specific size/rate limits and redacted provider error translation; TypeScript request casts are not runtime validation. See docs/integration-audit.md.
import { getHeader, createError, getRequestWebStream, type H3Event } from 'h3';
export async function boundedJson(
  event: H3Event,
  maximum = 150000,
): Promise<Record<string, unknown>> {
  if (!getHeader(event, 'content-type')?.startsWith('application/json'))
    throw createError({ statusCode: 415, statusMessage: 'Use JSON content' });
  const stream = getRequestWebStream(event);
  if (!stream) throw createError({ statusCode: 400, statusMessage: 'JSON body required' });
  const reader = stream.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximum) {
      await reader.cancel();
      throw createError({ statusCode: 413, statusMessage: 'Request is too large' });
    }
    chunks.push(value);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error();
    return body;
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' });
  }
}
