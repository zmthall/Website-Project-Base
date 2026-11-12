/** Separate customer session; never grants administrator permissions. */
export function useCustomerAuth() {
  return useNuxtApp().$customerAuth;
}
