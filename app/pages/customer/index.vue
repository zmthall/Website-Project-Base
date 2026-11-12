<script setup lang="ts">
// TODO [AUTH-03]: Replace long-term environment preset passwords with managed provisioning/MFA and audited role changes; add password-change, deletion and recovery policies for registered accounts. See docs/integration-audit.md.

useSEO({ title: 'Customer account', robots: { index: false, follow: false } });
const auth = useCustomerAuth();
const account = auth.account;
</script>
<template>
  <section v-if="auth.isAuthenticated.value && account" class="container section stack">
    <ContentEyebrow>Customer account</ContentEyebrow>
    <h1>Hello, {{ account.displayName || account.email }}.</h1>
    <NuxtLink to="/customer/workflows">Your appointments, estimates and demo payments</NuxtLink>
    <h2>Your account</h2>
    <p>{{ account.email }}</p>
    <p>{{ account.emailVerified ? 'Email verified' : 'Email not verified' }}</p>
  </section>
</template>
