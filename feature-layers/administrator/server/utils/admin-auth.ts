// TODO [AUTH-01]: Move sessions and login throttles into shared expiring storage; verify trusted proxy handling, origin/CSRF checks, revocation and restart/expiry behavior across replicas. See docs/integration-audit.md.
import { localAuthPolicy } from '../../../../server/utils/auth-settings';
import { equalSecret } from '../../../../server/utils/secrets';
import { randomBytes } from 'node:crypto';
import { createError, getCookie, getHeader, setCookie, type H3Event } from 'h3';
import { site } from '../../../../shared/data/site';
import type { AdminSession } from '../../app/features/administrator/types';

const cookie = 'admin_session';
type Entry = { csrf: string; expires: number; session: AdminSession | null };
const sessions = new Map<string, Entry>();
const attempts = new Map<string, { count: number; expires: number }>();
const startedAt = new Date().toISOString();
let lastLogin: string | null = null;
export function adminConfig(event: H3Event) {
  const config = useRuntimeConfig(event);
  if (site.features.administrator !== 'local' || !config.adminEmail || !config.adminPassword)
    throw createError({
      statusCode: 503,
      statusMessage: 'Local administrator login is not configured',
    });
  return config;
}
export function getAdminEntry(event: H3Event, create = false): Entry | undefined {
  const now = Date.now();
  for (const [key, value] of sessions)
    if (value.expires <= now || (value.session && Date.parse(value.session.idleExpiresAt) <= now))
      sessions.delete(key);
  let entry = sessions.get(getCookie(event, cookie) || '');
  if (!entry && create) {
    if (sessions.size >= 10000) throw createError({ statusCode: 503 });
    const lifetime = localAuthPolicy('admin').sessionDurationMinutes * 60000;
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
export function requireAdmin(event: H3Event) {
  const config = adminConfig(event);
  const entry = getAdminEntry(event);
  if (!entry?.session || entry.session.account.email !== config.adminEmail)
    throw createError({ statusCode: 401, statusMessage: 'Administrator login required' });
  return entry;
}
export function requireCsrf(event: H3Event) {
  const entry = getAdminEntry(event);
  const token = getHeader(event, 'x-csrf-token');
  if (!entry || !token || !equalSecret(token, entry.csrf))
    throw createError({ statusCode: 403, statusMessage: 'Invalid CSRF token' });
  return entry;
}
export function limitAdminLogin(event: H3Event) {
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
export function loginAdmin(event: H3Event) {
  const config = adminConfig(event);
  sessions.delete(getCookie(event, cookie) || '');
  const entry = getAdminEntry(event, true)!;
  const now = new Date().toISOString();
  entry.session = {
    provider: 'local',
    expiresAt: new Date(entry.expires).toISOString(),
    idleExpiresAt: new Date(
      Date.now() + localAuthPolicy('admin').idleTimeoutMinutes * 60000,
    ).toISOString(),
    account: {
      id: 'env-admin',
      email: config.adminEmail,
      displayName: config.adminName,
      emailVerified: false,
      roles: ['admin'],
      permissions: ['auth:configure'],
      createdAt: startedAt,
      lastLoginAt: now,
      previousLoginAt: lastLogin,
    },
  };
  lastLogin = now;
  return entry;
}
export function logoutAdmin(event: H3Event) {
  sessions.delete(getCookie(event, cookie) || '');
  setCookie(event, cookie, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'strict',
  });
}
export function refreshAdmin(entry: Entry) {
  if (entry.session)
    entry.session.idleExpiresAt = new Date(
      Math.min(entry.expires, Date.now() + localAuthPolicy('admin').idleTimeoutMinutes * 60000),
    ).toISOString();
  return { provider: 'local', session: entry.session, csrfToken: entry.csrf };
}
