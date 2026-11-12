import { createError } from 'h3';
import { managementStore } from './management-store';
import type { LocalAuthPolicy } from '../../shared/types/management';
export function validateAuthPolicy(value: unknown): LocalAuthPolicy {
  const data = value as Partial<LocalAuthPolicy> | null;
  if (
    !data ||
    !Number.isInteger(data.sessionDurationMinutes) ||
    !Number.isInteger(data.idleTimeoutMinutes) ||
    data.sessionDurationMinutes! < 1 ||
    data.sessionDurationMinutes! > 43200 ||
    data.idleTimeoutMinutes! < 1 ||
    data.idleTimeoutMinutes! > data.sessionDurationMinutes!
  )
    throw createError({
      statusCode: 400,
      statusMessage:
        'Use whole minutes, with idle timeout between 1 and the session duration; maximum 30 days.',
    });
  return {
    sessionDurationMinutes: data.sessionDurationMinutes!,
    idleTimeoutMinutes: data.idleTimeoutMinutes!,
  };
}
export function localAuthPolicy(audience: 'admin' | 'customer') {
  return managementStore().policy(audience);
}
