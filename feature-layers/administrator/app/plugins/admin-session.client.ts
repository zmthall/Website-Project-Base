export default defineNuxtPlugin({
  dependsOn: ['admin-auth'],
  setup() {
    const auth = useAdminAuth();
    const route = useRoute();
    let lastRefresh = Date.now();
    const check = () => auth.checkExpiry();
    // Only real user activity extends the server-owned idle deadline, never a polling timer.
    const activity = () => {
      check();
      if (
        route.path.startsWith('/admin') &&
        auth.isAuthenticated.value &&
        !auth.busy.value &&
        Date.now() - lastRefresh > 60000
      ) {
        lastRefresh = Date.now();
        void auth.restore();
      }
    };
    const interval = window.setInterval(check, 15000);
    window.addEventListener('focus', activity);
    window.addEventListener('pointerdown', activity);
    window.addEventListener('keydown', activity);
    const stop = watch(auth.isAuthenticated, (loggedIn, wasLoggedIn) => {
      if (
        wasLoggedIn &&
        !loggedIn &&
        route.path.startsWith('/admin') &&
        route.path !== '/admin/login'
      )
        void navigateTo('/admin/login');
    });
    if (import.meta.hot)
      import.meta.hot.dispose(() => {
        clearInterval(interval);
        window.removeEventListener('focus', activity);
        window.removeEventListener('pointerdown', activity);
        window.removeEventListener('keydown', activity);
        stop();
      });
  },
});
