<script setup lang="ts">
// TODO [A11Y-01]: Complete keyboard-only, real Safari/iOS and screen-reader tests for dialogs/forms/calendar/customer actions, including loading/error/focus transitions and narrow layouts. See docs/integration-audit.md.

// TODO [PAY-04]: Add an owner-checked invoice resolver and refund/dispute/partial-payment lifecycle, reconciliation jobs and downloadable verified receipts before exposing invoice payments. See docs/integration-audit.md.

import { workflows } from '#shared/data/workflows';
import type { Estimate, PaymentSession, PaymentStatus } from '#shared/types/workflows';
useSEO({ title: 'Your demo requests', robots: { index: false, follow: false } });
const { estimates, payments } = useWorkflows();
const appointmentEnabled = useFeature('appointments');
const estimateEnabled = useFeature('estimates');
const paymentEnabled = useFeature('payments');
const estimateList = ref<Estimate[]>([]);
const paymentList = ref<PaymentSession[]>([]);
const busy = ref(false);
const error = ref('');
const message = ref('');
const key = useWorkflowKey();
async function load() {
  if (estimateEnabled.value) estimateList.value = await estimates.list();
  if (paymentEnabled.value) paymentList.value = await payments.list();
}
async function run(action: () => Promise<unknown>) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    await action();
    await load();
    message.value = 'Demo records updated.';
  } catch (e) {
    error.value =
      (e as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Operation failed. Refresh and try again.';
  } finally {
    busy.value = false;
  }
}
onMounted(() => run(load));
const money = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
const outcomes: PaymentStatus[] = ['succeeded', 'declined', 'canceled', 'failed'];
</script>
<template>
  <section class="container section stack">
    <h1>Your demo requests</h1>
    <p class="muted">
      Local simulation. Records reset on server restart. No real bookings, quotes, messages or
      charges.
    </p>
    <p v-if="error" role="alert" class="alert">{{ error }}</p>
    <p role="status" aria-live="polite">{{ busy ? 'Loading…' : message }}</p>
    <BaseButton :disabled="busy" variant="outline" @click="run(load)">Refresh records</BaseButton>
    <AppointmentsCustomerManager v-if="appointmentEnabled" />
    <section v-if="estimateEnabled" class="stack">
      <h2>Estimates</h2>
      <NuxtLink to="/estimates">Request a demo estimate</NuxtLink>
      <p v-if="!estimateList.length">No estimates yet.</p>
      <article v-for="e in estimateList" :key="e.id" class="stack">
        <h3>{{ e.request.service }}</h3>
        <p>{{ e.request.description }}</p>
        <p>Status: {{ e.status }} · Reference: {{ e.id }}</p>
        <ul v-if="e.attachments.length" aria-label="Estimate attachments">
          <li v-for="attachment in e.attachments" :key="attachment.id">
            <a :href="`/api/uploads/${attachment.id}/content`">{{ attachment.name }}</a>
          </li>
        </ul>
        <ul>
          <li v-for="(item, index) in e.items" :key="index">
            {{ item.description }} · {{ item.quantity }} × {{ money(item.unitAmount) }}
          </li>
        </ul>
        <p v-if="e.items.length">
          Total: {{ money(e.total.amount) }} · Deposit: {{ money(e.depositAmount) }}
        </p>
        <p v-if="e.expiresAt">Valid until {{ new Date(e.expiresAt).toLocaleString() }}</p>
        <div v-if="e.status === 'sent' && workflows.estimates.acceptanceEnabled" class="cluster">
          <BaseButton
            :disabled="busy"
            @click="
              run(() =>
                estimates.decide(
                  e.id,
                  'accepted',
                  e.version,
                  key({ id: e.id, decision: 'accepted', version: e.version }),
                ),
              )
            "
          >
            Accept estimate
          </BaseButton>
          <BaseButton
            :disabled="busy"
            variant="outline"
            @click="
              run(() =>
                estimates.decide(
                  e.id,
                  'declined',
                  e.version,
                  key({ id: e.id, decision: 'declined', version: e.version }),
                ),
              )
            "
          >
            Decline estimate
          </BaseButton>
        </div>
        <BaseButton
          v-if="paymentEnabled && e.status === 'accepted' && e.depositAmount > 0"
          :disabled="busy"
          variant="outline"
          @click="
            run(() =>
              payments.create(
                { type: 'estimate-deposit', estimateId: e.id },
                key({ estimateId: e.id }),
              ),
            )
          "
        >
          Start demo deposit
        </BaseButton>
      </article>
    </section>
    <section v-if="paymentEnabled" class="stack">
      <h2>Payments · Simulation only</h2>
      <p>No card details or real money.</p>
      <BaseButton
        v-for="product in workflows.payments.products"
        :key="product.id"
        :disabled="busy"
        @click="
          run(() =>
            payments.create(
              { type: 'one-time', productId: product.id },
              key({ productId: product.id }),
            ),
          )
        "
      >
        {{ product.label }} · {{ money(product.amount) }}
      </BaseButton>
      <article v-for="p in paymentList" :key="p.id" class="stack">
        <h3>{{ money(p.total.amount) }} · {{ p.status }}</h3>
        <p>Reference: {{ p.id }}</p>
        <p v-if="p.receipt">Demo receipt: {{ p.receipt.id }} · Verified by the demo server.</p>
        <div v-if="p.status === 'pending'" class="cluster">
          <BaseButton
            v-for="outcome in outcomes"
            :key="outcome"
            :disabled="busy"
            variant="outline"
            @click="
              run(async () => {
                const s = await $fetch<{ csrfToken: string }>('/api/customer/auth/session');
                await $fetch(`/api/workflows/payments/${p.id}/simulate`, {
                  method: 'POST',
                  headers: { 'X-CSRF-Token': s.csrfToken },
                  body: { outcome },
                });
              })
            "
          >
            Simulate {{ outcome }}
          </BaseButton>
        </div>
        <BaseButton :disabled="busy" variant="outline" @click="run(() => payments.verify(p.id))">
          Check payment status
        </BaseButton>
      </article>
    </section>
  </section>
</template>
