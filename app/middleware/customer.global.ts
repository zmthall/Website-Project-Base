export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/customer' && !to.path.startsWith('/customer/')) return;
  setPageLayout('customer');
  if (!useFeature('customer').value)
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  if (import.meta.server) return;
  const auth = useCustomerAuth();
  auth.checkExpiry();
  if (to.path === '/customer/login') return;
  await auth.restore();
  if (!auth.isAuthenticated.value) return navigateTo('/customer/login', { replace: true });
});
