import { createHash, timingSafeEqual } from 'node:crypto';

/** Constant-time comparison for bounded credentials and anti-CSRF tokens. */
export function equalSecret(a: string, b: string) {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}
