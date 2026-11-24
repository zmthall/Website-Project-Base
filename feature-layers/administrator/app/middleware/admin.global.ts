export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/admin' && !to.path.startsWith('/admin/')) return;
  setPageLayout('admin');
  if (!useFeature('administrator').value)
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  if (import.meta.server) return;
  const auth = useAdminAuth();
  auth.checkExpiry();
  if (to.path === '/admin/login') return;
  await auth.restore();
  if (!auth.isAuthenticated.value) return navigateTo('/admin/login', { replace: true });
});
