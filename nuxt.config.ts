// TODO [OPS-01]: Add trusted proxy/HTTPS configuration, tailored CSP and redacted metrics/error reporting; exercise provider timeout/retry behavior and prevent secrets in browser/build artifacts. See docs/integration-audit.md.
import tailwindcss from '@tailwindcss/vite';
import { featureLayerPaths } from './feature-layers/registry';
import { integrationDefaults } from './server/config/integrations';
import { site } from './shared/data/site';

export default defineNuxtConfig({
  extends: featureLayerPaths,
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: { enabled: process.env.NUXT_DISABLE_DEVTOOLS !== '1' },
  // Run nuxt typecheck in the build script; the Vite checker splits paths with spaces.
  typescript: { strict: true, typeCheck: false },
  sourcemap: { server: false, client: false },
  modules: ['@nuxt/image', '@nuxt/eslint', '@nuxtjs/mdc'],
  css: [
    '~/assets/css/main.css',
    '~/assets/css/admin.css',
    '~/assets/css/prose.css',
    '~/assets/css/forms.css',
  ],
  vite: {
    plugins: [tailwindcss()],
    // Prose templates and MDC must share Vue's active rendering instance.
    resolve: {
      dedupe: ['vue', '@vue/runtime-core', '@vue/runtime-dom', '@vue/reactivity', '@vue/shared'],
    },
  },
  components: [
    { path: '~/components', pathPrefix: true },
    { path: '~/components/prose', pathPrefix: false, global: true },
  ],
  runtimeConfig: {
    integrations: integrationDefaults,
    // Optional internal backend URL used only during SSR. No credentials here.
    apiBase: '',
    adminEmail: '',
    adminPassword: '',
    adminName: 'Administrator',
    indexingEnabled: false,
    public: { apiBase: '/api' },
  },
  app: { head: { htmlAttrs: { lang: site.locale.default } } },
  image: {
    provider: 'ipx',
    domains: [],
    format: ['webp'],
    quality: 80,
    screens: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
  },
  routeRules: {
    '/admin': {
      ssr: false,
      headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
    },
    '/admin/**': {
      ssr: false,
      headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
    },
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    },
    // API responses may be personalized; page caching is opt-in per route.
    '/api/**': { cache: false, headers: { 'Cache-Control': 'no-store' } },
  },
});
