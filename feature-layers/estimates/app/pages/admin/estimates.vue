<script setup lang="ts">
// TODO [EST-01]: Add audited multi-line revisions/requote/withdrawal policies, tax/discount/currency rules and durable acceptance evidence; preserve accepted versions when quoting changes. See docs/integration-audit.md.

import type { Estimate } from '#shared/types/workflows';
useSEO({ title: 'Demo estimates', robots: { index: false, follow: false } });
if (!useFeature('estimates').value) throw createError({ statusCode: 404 });
const auth = useAdminAuth();
const records = ref<Estimate[]>([]);
const selected = ref<Estimate>();
const busy = ref(false);
const error = ref('');
const message = ref('');
const description = ref('Example project work');
const quantity = ref<string | number>(1);
const unitAmount = ref<string | number>(10000);
const deposit = ref<string | number>(0);
const expires = ref('');
async function load() {
  records.value = await $fetch<Estimate[]>('/api/workflows/estimates/admin');
}
async function run(action: () => Promise<unknown>) {
  busy.value = true;
  error.value = '';
  try {
    await action();
    await load();
  } catch (e) {
    error.value =
      (e as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Unable to update estimates';
  } finally {
    busy.value = false;
  }
}
onMounted(() => run(load));
async function send() {
  if (!selected.value) return;
  await run(async () => {
    await auth.authorized((csrf) =>
      $fetch(`/api/workflows/estimates/admin/${selected.value!.id}`, {
        method: 'PUT',
        headers: { 'X-CSRF-Token': csrf },
        body: {
          version: selected.value!.version,
          items: [
            {
              description: description.value,
              quantity: Number(quantity.value),
              unitAmount: Number(unitAmount.value),
            },
          ],
          depositAmount: Number(deposit.value),
          expiresAt: new Date(expires.value).toISOString(),
        },
      }),
    );
    selected.value = undefined;
    message.value = 'Demo quote sent to the customer account. No email sent.';
  });
}
</script>
<template>
  <section class="container section stack">
    <h1>Demo estimates</h1>
    <p class="muted">
      Process-local simulation. Amounts below are USD cents. Records reset on restart.
    </p>
    <p v-if="error" role="alert" class="alert">{{ error }}</p>
    <p role="status">{{ busy ? 'Loading…' : message }}</p>
    <BaseButton :disabled="busy" variant="outline" @click="run(load)">Refresh estimates</BaseButton>
    <p v-if="!records.length">No requests yet.</p>
    <article v-for="e in records" :key="e.id" class="stack">
      <h2>{{ e.request.contact.name }} · {{ e.status }}</h2>
      <p>{{ e.request.description }}</p>
      <p>{{ e.request.contact.email }}</p>
      <ul v-if="e.attachments.length" aria-label="Estimate attachments">
        <li v-for="attachment in e.attachments" :key="attachment.id">
          <a :href="`/api/admin/uploads/${attachment.id}/content`">{{ attachment.name }}</a>
        </li>
      </ul>
      <BaseButton
        v-if="e.status === 'requested' || e.status === 'draft'"
        :disabled="busy"
        @click="selected = e"
      >
        Prepare demo quote
      </BaseButton>
    </article>
    <form v-if="selected" class="stack" @submit.prevent="send">
      <h2>Quote {{ selected.request.service }}</h2>
      <FormsField v-slot="{ id }" label="Line item" required>
        <FormsInput :id="id" v-model="description" required />
      </FormsField>
      <FormsField v-slot="{ id }" label="Quantity" required>
        <FormsNumber :id="id" v-model="quantity" min="1" max="10000" required />
      </FormsField>
      <FormsField v-slot="{ id }" label="Unit amount (USD cents)" required>
        <FormsNumber :id="id" v-model="unitAmount" min="1" required />
      </FormsField>
      <FormsField v-slot="{ id }" label="Deposit (USD cents)">
        <FormsNumber :id="id" v-model="deposit" min="0" />
      </FormsField>
      <FormsField v-slot="{ id }" label="Expires at (your local time)" required>
        <FormsInput :id="id" v-model="expires" type="datetime-local" required />
      </FormsField>
      <BaseButton type="submit" :disabled="busy">Send demo quote</BaseButton>
      <BaseButton variant="outline" @click="selected = undefined">Cancel preparation</BaseButton>
    </form>
  </section>
</template>
