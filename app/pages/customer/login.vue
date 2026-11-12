<script setup lang="ts">
useSEO({ title: 'Customer sign in', robots: { index: false, follow: false } });
const auth = useCustomerAuth();
const email = ref('');
const password = ref('');
const registering = ref(false);
onMounted(async () => {
  if (auth.status.value === 'unknown' && (await auth.restore()))
    await navigateTo('/customer', { replace: true });
});
async function submit() {
  try {
    const success = await (registering.value ? auth.register : auth.login)(
      email.value,
      password.value,
    );
    if (success && auth.isAuthenticated.value) await navigateTo('/customer', { replace: true });
  } finally {
    password.value = '';
  }
}
</script>
<template>
  <section class="container section stack customer-login">
    <ContentEyebrow>Customer account</ContentEyebrow>
    <h1>{{ registering ? 'Create your account.' : 'Welcome back.' }}</h1>
    <p v-if="auth.error.value" role="alert" class="alert">{{ auth.error.value }}</p>
    <p v-if="auth.message.value" role="status">{{ auth.message.value }}</p>
    <form class="stack" @submit.prevent="submit">
      <label>
        Email address
        <input
          v-model="email"
          type="email"
          autocomplete="username"
          required
          maxlength="254"
          :disabled="auth.busy.value"
        />
      </label>
      <label>
        Password
        <input
          v-model="password"
          type="password"
          :autocomplete="registering ? 'new-password' : 'current-password'"
          :minlength="registering ? 12 : undefined"
          maxlength="1024"
          required
          :disabled="auth.busy.value"
        />
      </label>
      <p v-if="registering" class="muted">Use at least 12 characters for your password.</p>
      <BaseButton type="submit" :loading="auth.busy.value">
        {{ registering ? 'Create account' : 'Sign in' }}
      </BaseButton>
    </form>
    <BaseButton
      variant="text"
      :disabled="auth.busy.value"
      @click="
        registering = !registering;
        password = '';
      "
    >
      {{ registering ? 'Back to sign in' : 'Create a customer account' }}
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
.customer-login {
  max-width: 36rem;
}
label {
  display: grid;
  gap: 0.4rem;
}
input {
  border: 1px solid var(--line);
  background: var(--field);
  color: var(--ink);
  padding: 0.8rem;
  border-radius: var(--radius);
}
</style>
