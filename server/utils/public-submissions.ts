// TODO [CONTACT-01]: Connect configured notification routing and acknowledgments, shared abuse controls and retention/deletion; a stored message is not a delivered email. See docs/integration-audit.md.
import { createError, type H3Event } from 'h3';
import { site } from '../../shared/data/site';
import type { SiteFeatures } from '../../shared/types/site';
const attempts = new Map<string, { count: number; expires: number }>();
export function checkPublicSubmission(event: H3Event, feature: keyof SiteFeatures) {
  if (site.features[feature] !== true) throw createError({ statusCode: 404 });
  const now = Date.now();
  for (const [key, item] of attempts) if (item.expires <= now) attempts.delete(key);
  const key = feature + ':' + (event.node.req.socket.remoteAddress || 'unknown');
  const item = attempts.get(key) || { count: 0, expires: now + 15 * 60000 };
  if (item.count >= 15 || attempts.size >= 10000)
    throw createError({ statusCode: 429, statusMessage: 'Too many submissions. Try again later.' });
  item.count++;
  attempts.set(key, item);
}
export function requireSubmissionConsent(body: Record<string, unknown>) {
  const consent = body.consent as Record<string, unknown> | undefined;
  if (consent?.granted !== true)
    throw createError({ statusCode: 400, statusMessage: 'Consent is required' });
}
