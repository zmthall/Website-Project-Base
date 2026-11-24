// TODO [OPS-01]: Add trusted proxy/HTTPS configuration, tailored CSP and redacted metrics/error reporting; exercise provider timeout/retry behavior and prevent secrets in browser/build artifacts. See docs/integration-audit.md.
import { getAdminEntry, requireAdmin, requireCsrf } from '../utils/admin-auth';
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if ((path === '/admin' || path.startsWith('/admin/')) && path !== '/admin/login') {
    if (!getAdminEntry(event)?.session) return sendRedirect(event, '/admin/login', 302);
    requireAdmin(event);
  }
  if (path === '/api/admin' || path.startsWith('/api/admin/')) {
    setHeader(event, 'Cache-Control', 'no-store');
    if (
      ['/api/admin/auth/session', '/api/admin/auth/login', '/api/admin/auth/logout'].includes(path)
    )
      return;
    requireAdmin(event);
    if (!['GET', 'HEAD'].includes(event.method)) requireCsrf(event);
  }
});
