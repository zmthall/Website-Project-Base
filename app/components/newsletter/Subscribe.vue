<script setup lang="ts">
const email = ref('');
const consent = ref(false);
const busy = ref(false);
const message = ref('');
async function subscribe() {
  busy.value = true;
  message.value = '';
  try {
    await $fetch('/api/newsletter/subscriptions', {
      method: 'POST',
      body: { email: email.value, listId: 'main', consent: { granted: consent.value } },
    });
    message.value =
      'Your subscription request has been saved. Email delivery is not connected yet.';
  } catch {
    message.value = 'Your request could not be saved. Please try again.';
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <form class="stack admin-form" @submit.prevent="subscribe">
    <h2>Stay in the loop</h2>
    <p>Register your interest in future email updates.</p>
    <label>
      Email address
      <input v-model="email" type="email" required maxlength="254" autocomplete="email" />
    </label>
    <label>
      <input v-model="consent" type="checkbox" required />
      I agree to have my email stored for newsletter updates.
    </label>
    <BaseButton type="submit" :disabled="busy">
      {{ busy ? 'Saving…' : 'Request subscription' }}
    </BaseButton>
    <p v-if="message" role="status">{{ message }}</p>
  </form>
</template>
