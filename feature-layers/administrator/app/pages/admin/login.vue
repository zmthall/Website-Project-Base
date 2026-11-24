<script setup lang="ts">
useSEO({ title: 'Administrator sign in', robots: { index: false, follow: false } });
const auth = useAdminAuth();
const site = useSiteConfig();
const email = ref('');
const password = ref('');
const recovery = ref(false);
const recoverySent = ref(false);
onMounted(async () => {
  if (auth.status.value === 'unknown' && (await auth.restore()))
    await navigateTo('/admin', { replace: true });
});
async function submit() {
  recoverySent.value = false;
  try {
    if (recovery.value) recoverySent.value = await auth.resetPassword(email.value);
    else if (await auth.login(email.value, password.value))
      await navigateTo('/admin', { replace: true });
  } finally {
    password.value = '';
  }
}
</script>
<template>
  <section class="container section stack admin-login">
    <ContentEyebrow>Administrator access</ContentEyebrow>
    <h1>{{ recovery ? 'Recover your account.' : 'Welcome back.' }}</h1>
    <p class="muted">
      Sign-in provider: {{ auth.provider.value ?? site.features?.administrator }}. Access is restricted to
      administrator accounts.
    </p>
    <p class="muted">Use your configured administrator account to sign in.</p>
    <p v-if="auth.error.value" class="alert" role="alert">{{ auth.error.value }}</p>
    <p v-if="recoverySent" role="status">
      If the account is eligible, recovery instructions will be sent. Check your inbox.
    </p>
    <form class="stack admin-form" @submit.prevent="submit">
      <FormsField v-slot="{ id }" label="Email address" required>
        <FormsInput
          :id="id"
          v-model="email"
          type="email"
          autocomplete="username"
          required
          maxlength="254"
          :disabled="auth.busy.value"
        />
      </FormsField>
      <FormsField v-if="!recovery" v-slot="{ id }" label="Password" required>
        <FormsInput
          :id="id"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          :disabled="auth.busy.value"
        />
      </FormsField>
      <BaseButton type="submit" :loading="auth.busy.value">
        {{ recovery ? 'Request recovery' : 'Sign in' }}
      </BaseButton>
    </form>
    <p v-if="site.features?.administrator === 'local'" class="muted">
      To reset a local administrator password, update the server environment and restart the server.
    </p>
    <BaseButton
      v-if="site.features?.administrator !== 'local'"
      variant="text"
      :disabled="auth.busy.value"
      @click="
        recovery = !recovery;
        password = '';
        recoverySent = false;
      "
    >
      {{ recovery ? 'Back to sign in' : 'Forgot password?' }}
    </BaseButton>
    <BaseButton
      v-if="auth.error.value.includes('server could not confirm sign-out')"
      variant="outline"
      @click="auth.logout()"
    >
      Retry sign-out
    </BaseButton>
    <NuxtLink to="/">Return to website</NuxtLink>
  </section>
</template>
<style scoped>
.admin-login {
  max-width: 36rem;
}
</style>
