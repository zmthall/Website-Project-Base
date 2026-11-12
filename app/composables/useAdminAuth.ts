/** Shared request-local admin session store. Passwords/provider credentials never belong here. */
export function useAdminAuth() {
  return useNuxtApp().$adminAuth;
}
