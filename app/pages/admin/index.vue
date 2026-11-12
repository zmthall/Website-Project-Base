<script setup lang="ts">
import { resources, resourceKinds } from '#shared/data/management';
import type { SiteFeatures } from '#shared/types/site';
useSEO({ title: 'Administration', robots: { index: false, follow: false } });
const auth = useAdminAuth();
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
</script>
<template>
  <div v-if="auth.isAuthenticated.value" class="container section stack">
    <header class="stack">
      <ContentEyebrow>Administration</ContentEyebrow>
      <h1>Hello, {{ auth.account.value?.displayName }}.</h1>
      <p class="muted">Manage your website content and incoming requests.</p>
    </header>
    <section class="stack">
      <h2>Your account</h2>
      <p>{{ auth.account.value?.email }}</p>
      <p>{{ auth.account.value?.emailVerified ? 'Email verified' : 'Email not verified' }}</p>
    </section>
    <div class="admin-grid">
      <NuxtLink v-for="kind in enabled" :key="kind" :to="links[kind]" class="admin-card">
        <h2>{{ resources[kind].title }}</h2>
        <p class="muted">{{ resources[kind].description }}</p>
      </NuxtLink>
      <NuxtLink v-if="site.features?.estimates" to="/admin/estimates" class="admin-card">
        Demo estimate requests
      </NuxtLink>
      <NuxtLink to="/admin/auth" class="admin-card">
        <h2>Authentication settings</h2>
        <p class="muted">Review admin and customer providers, accounts, and session policies.</p>
      </NuxtLink>
    </div>
  </div>
</template>
