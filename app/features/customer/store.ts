import { computed, readonly, ref } from 'vue';
import type {
  CustomerAuthAdapter,
  CustomerSession,
  CustomerSessionResponse,
  AuthProvider,
} from './types';

export function sessionIsCustomer(session: CustomerSession | null, now = Date.now()): boolean {
  return Boolean(
    session &&
    Array.isArray(session.account?.roles) &&
    session.account.roles.includes('customer') &&
    Date.parse(session.expiresAt) > now &&
    Date.parse(session.idleExpiresAt) > now,
  );
}

/** Created once per Nuxt app/request, never a module singleton or browser-storage credential store. */
export function createCustomerAuthStore(
  adapter: CustomerAuthAdapter,
  now: () => number = Date.now,
) {
  const session = ref<CustomerSession | null>(null);
  const status = ref<'unknown' | 'loading' | 'anonymous' | 'authenticated' | 'unavailable'>(
    'unknown',
  );
  const provider = ref<AuthProvider | null>(null);
  const error = ref('');
  const message = ref('');
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
  function apply(response: CustomerSessionResponse) {
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
    if (response.session && !sessionIsCustomer(response.session, now())) {
      session.value = null;
      status.value = 'anonymous';
      error.value = 'An active customer account is required.';
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
        error.value =
          'Customer authentication is unavailable. The backend may not be connected yet.';
      }
      return false;
    } finally {
      busy.value = false;
    }
  }
  async function authenticate(email: string, password: string, registering = false) {
    if (busy.value) return false;
    message.value = '';
    if (!csrf) await restore();
    if (!csrf) return false;
    busy.value = true;
    error.value = '';
    const current = ++generation;
    try {
      const response = await (registering ? adapter.register : adapter.login)(
        email.trim(),
        password,
        csrf,
      );
      if (current !== generation) return false;
      const authenticated = apply(response);
      if (response.message) message.value = response.message;
      return authenticated || (registering && Boolean(response.message));
    } catch {
      if (current === generation) {
        session.value = null;
        status.value = 'anonymous';
        error.value = registering
          ? 'Unable to register. Use a valid email and a password of at least 12 characters, or try signing in.'
          : 'Unable to sign in. Check your credentials.';
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
    if (session.value && !sessionIsCustomer(session.value, now()))
      clear('Your session has expired. Please sign in again.');
  }
  return {
    session: readonly(session),
    provider: readonly(provider),
    status: readonly(status),
    error: readonly(error),
    busy: readonly(busy),
    account: computed(() => session.value?.account ?? null),
    isAuthenticated: computed(() => sessionIsCustomer(session.value, now())),
    restore,
    login: (email: string, password: string) => authenticate(email, password),
    register: (email: string, password: string) => authenticate(email, password, true),
    message: readonly(message),
    logout,
    checkExpiry,
  };
}
