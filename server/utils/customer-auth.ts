// TODO [AUTH-01]: Move sessions and login throttles into shared expiring storage; verify trusted proxy handling, origin/CSRF checks, revocation and restart/expiry behavior across replicas. See docs/integration-audit.md.
import { localAuthPolicy } from './auth-settings';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createError, getCookie, getHeader, setCookie, readBody, type H3Event } from 'h3';
import { site } from '../../shared/data/site';
import type { CustomerAccount, CustomerSession } from '../../app/features/customer/types';

const cookie = 'customer_session';
type Entry = { csrf: string; expires: number; session: CustomerSession | null };
const sessions = new Map<string, Entry>();
const attempts = new Map<string, { count: number; expires: number }>();
function equalSecret(a: string, b: string) {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}
export function customerConfig(event: H3Event) {
  const config = useRuntimeConfig(event);
  if (site.features.customer !== 'local')
    throw createError({
      statusCode: 503,
      statusMessage: 'Local customer authentication is not enabled',
    });
  return config;
}
export function getCustomerEntry(event: H3Event, create = false): Entry | undefined {
  const now = Date.now();
  for (const [key, value] of sessions)
    if (value.expires <= now || (value.session && Date.parse(value.session.idleExpiresAt) <= now))
      sessions.delete(key);
  let entry = sessions.get(getCookie(event, cookie) || '');
  if (!entry && create) {
    if (sessions.size >= 10000) throw createError({ statusCode: 503 });
    const lifetime = localAuthPolicy('customer').sessionDurationMinutes * 60000;
    const token = randomBytes(32).toString('hex');
    entry = { csrf: randomBytes(32).toString('hex'), expires: now + lifetime, session: null };
    sessions.set(token, entry);
    setCookie(event, cookie, token, {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'strict',
      path: '/',
      maxAge: lifetime / 1000,
    });
  }
  return entry;
}
export function requireCustomer(event: H3Event) {
  customerConfig(event);
  const entry = getCustomerEntry(event);
  if (
    !entry?.session ||
    entry.session.provider !== 'local' ||
    !entry.session.account.roles.includes('customer')
  )
    throw createError({ statusCode: 401, statusMessage: 'Customer login required' });
  return entry;
}
export function requireCustomerCsrf(event: H3Event) {
  const entry = getCustomerEntry(event);
  const token = getHeader(event, 'x-csrf-token');
  if (!entry || !token || !equalSecret(token, entry.csrf))
    throw createError({ statusCode: 403, statusMessage: 'Invalid CSRF token' });
  return entry;
}
export function limitCustomerLogin(event: H3Event) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  // Use the socket address; untrusted forwarded headers must not bypass this limit.
  const key = event.node.req.socket.remoteAddress || 'unknown';
  const attempt = attempts.get(key) || { count: 0, expires: now + 15 * 60 * 1000 };
  if (attempt.count >= 10 || attempts.size >= 10000)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many login attempts. Try again later.',
    });
  attempt.count++;
  attempts.set(key, attempt);
}
export function loginCustomer(event: H3Event, account: CustomerAccount) {
  customerConfig(event);
  sessions.delete(getCookie(event, cookie) || '');
  const entry = getCustomerEntry(event, true)!;
  entry.session = {
    provider: 'local',
    expiresAt: new Date(entry.expires).toISOString(),
    idleExpiresAt: new Date(
      Date.now() + localAuthPolicy('customer').idleTimeoutMinutes * 60000,
    ).toISOString(),
    account,
  };
  return entry;
}
export function logoutCustomer(event: H3Event) {
  sessions.delete(getCookie(event, cookie) || '');
  setCookie(event, cookie, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'strict',
  });
}
export function refreshCustomer(entry: Entry) {
  if (entry.session)
    entry.session.idleExpiresAt = new Date(
      Math.min(entry.expires, Date.now() + localAuthPolicy('customer').idleTimeoutMinutes * 60000),
    ).toISOString();
  return { provider: 'local', session: entry.session, csrfToken: entry.csrf };
}

export async function readCustomerCredentials(event: H3Event, registering = false) {
  const body = await readBody(event);
  if (
    typeof body?.email !== 'string' ||
    typeof body?.password !== 'string' ||
    body.email.length > 254 ||
    body.password.length > 1024 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
    !body.password ||
    (registering && body.password.length < 12)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Use a valid email and a password of at least 12 characters for registration',
    });
  return { email: body.email.trim().toLowerCase() as string, password: body.password as string };
}
