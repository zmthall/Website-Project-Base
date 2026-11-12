// TODO [OPS-01]: Add trusted proxy/HTTPS configuration, tailored CSP and redacted metrics/error reporting; exercise provider timeout/retry behavior and prevent secrets in browser/build artifacts. See docs/integration-audit.md.
import { isFeatureEnabled } from '../../shared/utils/features';
import { site } from '../../shared/data/site';
import { getCustomerEntry, requireCustomer, requireCustomerCsrf } from '../utils/customer-auth';
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if (
    (path === '/customer' ||
      path.startsWith('/customer/') ||
      path === '/api/customer' ||
      path.startsWith('/api/customer/')) &&
    !isFeatureEnabled(site.features, 'customer')
  )
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  if ((path === '/customer' || path.startsWith('/customer/')) && path !== '/customer/login') {
    if (!getCustomerEntry(event)?.session) return sendRedirect(event, '/customer/login', 302);
    requireCustomer(event);
  }
  if (path === '/api/customer' || path.startsWith('/api/customer/')) {
    setHeader(event, 'Cache-Control', 'no-store');
    if (
      [
        '/api/customer/auth/session',
        '/api/customer/auth/login',
        '/api/customer/auth/logout',
        '/api/customer/auth/register',
      ].includes(path)
    )
      return;
    requireCustomer(event);
    if (!['GET', 'HEAD'].includes(event.method)) requireCustomerCsrf(event);
  }
});
