export default defineNuxtConfig({
  runtimeConfig: {
    customerEmail: '',
    customerPassword: '',
    customerName: 'Customer',
    customerDatabase: '.data/customer-auth.sqlite',
  },
  routeRules: {
    '/customer': {
      ssr: false,
      headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
    },
    '/customer/**': {
      ssr: false,
      headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
    },
  },
});
