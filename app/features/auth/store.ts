import { computed, readonly, ref } from 'vue';
import type {
  AdminAuthAdapter,
  AdminSession,
  AdminSettingsUpdate,
  SessionResponse,
  AuthProvider,
} from './types';

export function sessionIsAdmin(session: AdminSession | null, now = Date.now()): boolean {
  return Boolean(
    session &&
    Array.isArray(session.account?.roles) &&
    session.account.roles.includes('admin') &&
    Date.parse(session.expiresAt) > now &&
    Date.parse(session.idleExpiresAt) > now,
  );
}

/** Created once per Nuxt app/request, never a module singleton or browser-storage credential store. */
export function createAdminAuthStore(adapter: AdminAuthAdapter, now: () => number = Date.now) {
  const session = ref<AdminSession | null>(null);
  const status = ref<'unknown' | 'loading' | 'anonymous' | 'authenticated' | 'unavailable'>(
    'unknown',
  );
  const provider = ref<AuthProvider | null>(null);
  const error = ref('');
  const busy = ref(false);
  let csrf = '';
  let generation = 0;
  function clear(message = '') {
    generation++;
    session.value = null;
    csrf = '';
    status.value = 'anonymous';
    error.value = message;
  }
  function apply(response: SessionResponse) {
    if (
      !response ||
      typeof response.csrfToken !== 'string' ||
      !response.csrfToken ||
      !('session' in response)
    )
      throw new Error('Invalid session response');
    if (response.provider) provider.value = response.provider;
    else if (response.session) provider.value = response.session.provider;
    csrf = response.csrfToken;
    if (response.session && !sessionIsAdmin(response.session, now())) {
      session.value = null;
      status.value = 'anonymous';
      error.value = 'An active administrator account is required.';
      return false;
    }
    session.value = response.session;
    status.value = response.session ? 'authenticated' : 'anonymous';
    return Boolean(response.session);
  }
  async function restore() {
    if (busy.value) return false;
    busy.value = true;
    error.value = '';
    status.value = 'loading';
    const current = ++generation;
    try {
      const response = await adapter.session();
      if (current !== generation) return false;
      return apply(response);
    } catch {
      if (current === generation) {
        session.value = null;
        csrf = '';
        status.value = 'unavailable';
        error.value = 'Admin authentication is unavailable. The backend may not be connected yet.';
      }
      return false;
    } finally {
      busy.value = false;
    }
  }
  async function login(email: string, password: string) {
    if (busy.value) return false;
    if (!csrf) await restore();
    if (!csrf) return false;
    busy.value = true;
    error.value = '';
    const current = ++generation;
    try {
      const response = await adapter.login(email.trim(), password, csrf);
      if (current !== generation) return false;
      return apply(response);
    } catch {
      if (current === generation) {
        session.value = null;
        status.value = 'anonymous';
        error.value = 'Unable to sign in. Check your credentials and administrator access.';
      }
      return false;
    } finally {
      busy.value = false;
    }
  }
  async function logout() {
    if (busy.value) return false;
    busy.value = true;
    error.value = '';
    const token = csrf;
    clear();
    try {
      await adapter.logout(token);
      return true;
    } catch {
      error.value =
        'Local account state was cleared, but the server could not confirm sign-out. Retry sign-out before leaving this device.';
      csrf = token;
      return false;
    } finally {
      busy.value = false;
    }
  }
  function checkExpiry() {
    if (session.value && !sessionIsAdmin(session.value, now()))
      clear('Your session has expired. Please sign in again.');
  }
  async function resetPassword(email: string) {
    if (busy.value) return false;
    if (!csrf) await restore();
    if (!csrf) return false;
    busy.value = true;
    error.value = '';
    try {
      await adapter.resetPassword(email.trim(), csrf);
      return true;
    } catch {
      error.value = 'The recovery request could not be completed. Please try again later.';
      return false;
    } finally {
      busy.value = false;
    }
  }
  async function getSettings() {
    checkExpiry();
    if (!sessionIsAdmin(session.value, now())) throw new Error('Administrator access required.');
    return adapter.getSettings();
  }
  async function saveSettings(update: AdminSettingsUpdate) {
    checkExpiry();
    if (!sessionIsAdmin(session.value, now()) || !csrf)
      throw new Error('Administrator access required.');
    await adapter.saveSettings(update, csrf);
    // Provider/session-policy changes require backend revalidation; never update authorization locally.
    await restore();
  }
  async function authorized<T>(operation: (csrf: string) => Promise<T>): Promise<T> {
    await restore();
    if (!sessionIsAdmin(session.value, now()) || !csrf)
      throw new Error('Administrator access required.');
    return operation(csrf);
  }
  return {
    authorized,
    session: readonly(session),
    provider: readonly(provider),
    status: readonly(status),
    error: readonly(error),
    busy: readonly(busy),
    account: computed(() => session.value?.account ?? null),
    isAuthenticated: computed(() => sessionIsAdmin(session.value, now())),
    restore,
    login,
    logout,
    resetPassword,
    checkExpiry,
    getSettings,
    saveSettings,
  };
}
