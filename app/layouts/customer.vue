<script setup lang="ts">
const auth = useCustomerAuth();
const router = useRouter();
// Nuxt's useRoute updates after page rendering. This gate must follow the
// router immediately so hiding the slot cannot block the login page from mounting.
const isLogin = computed(() => router.currentRoute.value.path === '/customer/login');
async function signOut() {
  await auth.logout();
  await navigateTo('/customer/login', { replace: true });
}
</script>
<template>
  <div class="customer-shell">
    <SystemOfflineNotice />
    <header class="customer-header container">
      <NuxtLink to="/customer" class="customer-brand">Customer account</NuxtLink>
      <nav aria-label="Customer account" class="customer-navigation">
        <NuxtLink v-if="auth.isAuthenticated.value" to="/customer">Dashboard</NuxtLink>
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
      <p v-else class="container section" role="status">Checking customer access…</p>
    </main>
  </div>
</template>
<style scoped>
.customer-shell {
  min-height: 100dvh;
}
.customer-header,
.customer-navigation {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.customer-header {
  justify-content: space-between;
  padding-block: 1rem;
  border-bottom: 1px solid var(--line);
}
.customer-brand {
  font-weight: 700;
}
</style>
