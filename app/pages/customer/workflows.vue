<script setup lang="ts">
// TODO [A11Y-01]: Complete keyboard-only, real Safari/iOS and screen-reader tests for dialogs/forms/calendar/customer actions, including loading/error/focus transitions and narrow layouts. See docs/integration-audit.md.

// TODO [PAY-04]: Add an owner-checked invoice resolver and refund/dispute/partial-payment lifecycle, reconciliation jobs and downloadable verified receipts before exposing invoice payments. See docs/integration-audit.md.

// TODO [BOOK-02]: Add explicit cancellation confirmation/policies, account prefill, refreshed day boundaries and recovery for changed staff/service availability without losing entered details. See docs/integration-audit.md.

import { workflows } from '#shared/data/workflows';
import type { Appointment, Estimate, PaymentSession, PaymentStatus } from '#shared/types/workflows';
useSEO({ title: 'Your demo requests', robots: { index: false, follow: false } });
const { appointments, estimates, payments } = useWorkflows();
const appointmentEnabled = useFeature('appointments');
const estimateEnabled = useFeature('estimates');
const paymentEnabled = useFeature('payments');
const bookingList = ref<Appointment[]>([]);
const estimateList = ref<Estimate[]>([]);
const paymentList = ref<PaymentSession[]>([]);
const busy = ref(false);
const error = ref('');
const message = ref('');
const active = ref<Appointment>();
const date = ref('');
const time = ref('');
const key = useWorkflowKey();
const slots = ref<{ value: string; label: string }[]>([]);
const slotLoading = ref(false);
let slotRevision = 0;
watch([active, date], async () => {
  const revision = ++slotRevision;
  time.value = '';
  slots.value = [];
  if (!active.value || !date.value) return;
  slotLoading.value = true;
  try {
    const a = active.value;
    const result = await appointments.availability({
      date: date.value,
      service: a.service,
      location: a.location,
      provider: a.provider,
    });
    if (revision === slotRevision)
      slots.value = result.map((s) => {
        const value = new Intl.DateTimeFormat('en-GB', {
          timeZone: a.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).format(new Date(s.startsAt));
        return { value, label: value };
      });
  } catch {
    if (revision === slotRevision)
      error.value = 'Could not load new times. Choose another date or retry.';
  } finally {
    if (revision === slotRevision) slotLoading.value = false;
  }
});
onBeforeUnmount(() => {
  slotRevision++;
});
async function load() {
  if (appointmentEnabled.value) bookingList.value = await appointments.list();
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
    <section v-if="appointmentEnabled" class="stack">
      <h2>Appointments</h2>
      <NuxtLink to="/appointments">Book a demo appointment</NuxtLink>
      <p v-if="!bookingList.length">No appointments yet.</p>
      <article v-for="a in bookingList" :key="a.id" class="stack">
        <h3>{{ a.service }}</h3>
        <p>
          {{ new Date(a.startsAt).toLocaleString('en-US', { timeZone: a.timeZone }) }} ·
          {{ a.timeZone }} · {{ a.status }}
        </p>
        <div v-if="a.status === 'confirmed'" class="cluster">
          <BaseButton :disabled="busy" variant="outline" @click="active = a">Reschedule</BaseButton>
          <BaseButton
            :disabled="busy"
            variant="outline"
            @click="
              run(() =>
                appointments.change(
                  a.id,
                  'cancel',
                  { version: a.version },
                  key({ id: a.id, version: a.version, action: 'cancel' }),
                ),
              )
            "
          >
            Cancel appointment
          </BaseButton>
        </div>
      </article>
      <form
        v-if="active"
        class="stack"
        @submit.prevent="
          run(async () => {
            await appointments.change(
              active!.id,
              'reschedule',
              { version: active!.version, date, time },
              key({ id: active!.id, version: active!.version, date, time }),
            );
            active = undefined;
          })
        "
      >
        <h3>Reschedule {{ active.service }}</h3>
        <FormsField v-slot="{ id }" label="New date" required>
          <FormsDate :id="id" v-model="date" required />
        </FormsField>
        <FormsField v-slot="{ id }" label="New time" :help="active.timeZone" required>
          <FormsSelect
            :id="id"
            v-model="time"
            :options="slots"
            placeholder="Choose an available time"
            :disabled="slotLoading"
            required
          />
        </FormsField>
        <BaseButton type="submit" :disabled="busy">Confirm reschedule</BaseButton>
        <BaseButton variant="outline" @click="active = undefined">
          Keep current appointment
        </BaseButton>
      </form>
    </section>
    <section v-if="estimateEnabled" class="stack">
      <h2>Estimates</h2>
      <NuxtLink to="/estimates">Request a demo estimate</NuxtLink>
      <p v-if="!estimateList.length">No estimates yet.</p>
      <article v-for="e in estimateList" :key="e.id" class="stack">
        <h3>{{ e.request.service }}</h3>
        <p>{{ e.request.description }}</p>
        <p>Status: {{ e.status }} · Reference: {{ e.id }}</p>
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
