<script setup lang="ts">
import { resources, resourceKinds } from '#shared/data/management';
import type { SiteFeatures } from '#shared/types/site';
const site = useSiteConfig();
const links = {
  jobs: '/admin/jobs',
  applications: '/admin/applications',
  blog: '/admin/blog',
  events: '/admin/events',
  messages: '/admin/messages',
  newsletters: '/admin/newsletters',
  reviews: '/admin/reviews',
  subscribers: '/admin/subscribers',
};
const enabled = computed(() =>
  resourceKinds.filter(
    (kind) => site.features?.[resources[kind].feature as keyof SiteFeatures] === true,
  ),
);
const auth = useAdminAuth();
const router = useRouter();
// Nuxt's useRoute updates after page rendering. This gate must follow the
// router immediately so hiding the slot cannot block the login page from mounting.
const isLogin = computed(() => router.currentRoute.value.path === '/admin/login');
async function signOut() {
  await auth.logout();
  await navigateTo('/admin/login', { replace: true });
}
</script>
<template>
  <div class="admin-shell">
    <SystemOfflineNotice />
    <header class="admin-header container">
      <NuxtLink to="/admin" class="admin-brand">Administration</NuxtLink>
      <nav aria-label="Administration" class="admin-navigation">
        <NuxtLink v-if="auth.isAuthenticated.value" to="/admin">Dashboard</NuxtLink>
        <template v-if="auth.isAuthenticated.value">
          <NuxtLink v-for="kind in enabled" :key="kind" :to="links[kind]">
            {{ resources[kind].title }}
          </NuxtLink>
          <NuxtLink v-if="site.features?.estimates" to="/admin/estimates" class="admin-card">
            Demo estimate requests
          </NuxtLink>
          <NuxtLink to="/admin/auth">Authentication</NuxtLink>
        </template>
        <NuxtLink to="/">View website</NuxtLink>
        <BaseButton
          v-if="auth.isAuthenticated.value"
          variant="outline"
          :disabled="auth.busy.value"
          @click="signOut"
        >
          Sign out
        </BaseButton>
      </nav>
    </header>
    <main id="main-content" tabindex="-1">
      <!-- Global route and server middleware enforce access. Also hide protected content
           immediately when the shared session expires or is cleared. -->
      <slot v-if="isLogin || auth.isAuthenticated.value" />
      <p v-else class="container section" role="status">Checking administrator access…</p>
    </main>
  </div>
</template>
<style scoped>
.admin-shell {
  min-height: 100dvh;
}
.admin-header,
.admin-navigation {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.admin-header {
  justify-content: space-between;
  padding-block: 1rem;
  border-bottom: 1px solid var(--line);
}
.admin-brand {
  font-weight: 700;
}
</style>
