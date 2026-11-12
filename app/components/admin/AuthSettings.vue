<script setup lang="ts">
import type { LocalAuthPolicy } from '#shared/types/management';
import type { AdminAuthSettings } from '../../features/auth/types';
interface Settings extends AdminAuthSettings {
  customer?: LocalAuthPolicy & {
    provider: string | false;
    registrationEnabled: boolean;
    presetConfigured: boolean;
  };
  admin?: { email: string; name: string; presetConfigured: boolean };
}
const api = useAdminManagement();
const settings = ref<Settings>();
const customer = ref<LocalAuthPolicy>({ sessionDurationMinutes: 480, idleTimeoutMinutes: 30 });
const busy = ref(false);
const error = ref('');
const message = ref('');
async function load() {
  busy.value = true;
  error.value = '';
  try {
    settings.value = await api.settings<Settings>();
    if (settings.value.customer)
      customer.value = {
        sessionDurationMinutes: settings.value.customer.sessionDurationMinutes,
        idleTimeoutMinutes: settings.value.customer.idleTimeoutMinutes,
      };
  } catch {
    error.value = 'Unable to load authentication settings.';
  } finally {
    busy.value = false;
  }
}
onMounted(load);
async function save() {
  if (!settings.value) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    await api.saveSettings({ settings: settings.value, customer: customer.value });
    message.value = 'Settings saved. New sessions use this policy.';
    await load();
  } catch (e) {
    error.value =
      (e as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Settings were not saved.';
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <section class="stack auth-settings">
    <h1>Authentication settings</h1>
    <p v-if="error" role="alert" class="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <BaseButton v-if="!settings" :loading="busy" @click="load">Retry loading settings</BaseButton>
    <form v-if="settings" class="stack" @submit.prevent="save">
      <fieldset :disabled="busy" class="stack">
        <legend>Administrator authentication</legend>
        <FormsField v-slot="{ id }" label="Login provider">
          <FormsSelect
            :id="id"
            v-model="settings.provider"
            :disabled="busy"
            :options="[
              { label: 'Local', value: 'local' },
              { label: 'Firebase — coming later', value: 'firebase', disabled: true },
              { label: 'Supabase — coming later', value: 'supabase', disabled: true },
            ]"
          />
        </FormsField>
        <p>Preset account: {{ settings.admin?.email || 'Configured on the server' }}</p>
        <p class="muted">
          Change credentials using NUXT_ADMIN_EMAIL, NUXT_ADMIN_PASSWORD, and NUXT_ADMIN_NAME in the
          server environment, then restart.
        </p>
        <FormsField v-slot="{ id }" label="Admin session duration (minutes)" required>
          <FormsNumber
            :id="id"
            :disabled="busy"
            v-model="settings.sessionDurationMinutes"
            min="1"
            max="43200"
            required
          />
        </FormsField>
        <FormsField v-slot="{ id }" label="Admin idle timeout (minutes)" required>
          <FormsNumber
            :id="id"
            :disabled="busy"
            v-model="settings.idleTimeoutMinutes"
            min="1"
            :max="settings.sessionDurationMinutes"
            required
          />
        </FormsField>
      </fieldset>
      <fieldset :disabled="busy" class="stack">
        <legend>Customer authentication</legend>
        <p>Provider: {{ settings.customer?.provider || 'Disabled' }}</p>
        <p>Registration: {{ settings.customer?.registrationEnabled ? 'Enabled' : 'Disabled' }}</p>
        <p>
          Preset customer account:
          {{ settings.customer?.presetConfigured ? 'Configured' : 'Not configured' }}
        </p>
        <p class="muted">
          Select the customer provider in site.features.customer. Local mode supports registration
          and NUXT_CUSTOMER_EMAIL, NUXT_CUSTOMER_PASSWORD, and NUXT_CUSTOMER_NAME. Firebase and
          Supabase will be added later.
        </p>
        <FormsField v-slot="{ id }" label="Customer session duration (minutes)" required>
          <FormsNumber
            :id="id"
            :disabled="busy"
            v-model="customer.sessionDurationMinutes"
            min="1"
            max="43200"
            required
          />
        </FormsField>
        <FormsField v-slot="{ id }" label="Customer idle timeout (minutes)" required>
          <FormsNumber
            :id="id"
            :disabled="busy"
            v-model="customer.idleTimeoutMinutes"
            min="1"
            :max="customer.sessionDurationMinutes"
            required
          />
        </FormsField>
      </fieldset>
      <p class="muted">
        Local accounts have no email verification or password recovery service yet. Passwords and
        provider secrets are never returned by this screen.
      </p>
      <BaseButton type="submit" :loading="busy">Save authentication settings</BaseButton>
    </form>
  </section>
</template>
