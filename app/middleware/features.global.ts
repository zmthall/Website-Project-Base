import { isFeaturePathEnabled } from '#shared/utils/features';
export default defineNuxtRouteMiddleware((to) => {
  if (!isFeaturePathEnabled(useSiteConfig().features, to.path)) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  }
});
