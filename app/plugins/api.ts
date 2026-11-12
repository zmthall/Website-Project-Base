// TODO [API-01]: Reconcile external feature contracts with local routes, supply credentials only to trusted backends, and reject uninstalled operations instead of assuming every adapter endpoint exists. See docs/integration-audit.md.
import { createApiClient } from '../api/client';

export default defineNuxtPlugin({
  name: 'api',
  setup() {
    const config = useRuntimeConfig();
    return {
      provide: {
        api: createApiClient({
          baseURL: import.meta.server
            ? config.apiBase || config.public.apiBase
            : config.public.apiBase,
          // Nuxt's local fetch supports relative Nitro endpoints during SSR.
          // Do not use useRequestFetch: incoming cookies/headers are not forwarded.
          fetch: $fetch,
        }),
      },
    };
  },
});
