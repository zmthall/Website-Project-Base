<script setup lang="ts">
// TODO [BOOK-02]: Add explicit cancellation confirmation/policies, account prefill, refreshed day boundaries and recovery for changed staff/service availability without losing entered details. See docs/integration-audit.md.
import type { Appointment } from '../../features/appointments';

const { appointments } = useWorkflows();
const bookingList = ref<Appointment[]>([]);
const active = ref<Appointment>();
const date = ref('');
const time = ref('');
const slots = ref<{ value: string; label: string }[]>([]);
const busy = ref(false);
const slotLoading = ref(false);
const error = ref('');
const message = ref('');
const key = useWorkflowKey();
let slotRevision = 0;

watch([active, date], async () => {
  const revision = ++slotRevision;
  time.value = '';
  slots.value = [];
  if (!active.value || !date.value) return;
  slotLoading.value = true;
  try {
    const appointment = active.value;
    const result = await appointments.availability({
      date: date.value,
      service: appointment.service,
      location: appointment.location,
      provider: appointment.provider,
    });
    if (revision === slotRevision)
      slots.value = result.map((slot) => {
        const value = new Intl.DateTimeFormat('en-GB', {
          timeZone: appointment.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).format(new Date(slot.startsAt));
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
  bookingList.value = await appointments.list();
}

async function run(action: () => Promise<unknown>) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    await action();
    await load();
    message.value = 'Appointment records updated.';
  } catch (cause) {
    error.value =
      (cause as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Appointment operation failed. Refresh and try again.';
  } finally {
    busy.value = false;
  }
}

onMounted(() => run(load));
</script>

<template>
  <section class="stack">
    <h2>Appointments</h2>
    <NuxtLink to="/appointments">Book a demo appointment</NuxtLink>
    <p v-if="error" role="alert" class="alert">{{ error }}</p>
    <p role="status" aria-live="polite">{{ busy ? 'Loading appointments…' : message }}</p>
    <BaseButton :disabled="busy" variant="outline" @click="run(load)">
      Refresh appointments
    </BaseButton>
    <p v-if="!bookingList.length && !busy">No appointments yet.</p>
    <article v-for="appointment in bookingList" :key="appointment.id" class="stack">
      <h3>{{ appointment.service }}</h3>
      <p>
        {{
          new Date(appointment.startsAt).toLocaleString('en-US', {
            timeZone: appointment.timeZone,
          })
        }}
        · {{ appointment.timeZone }} · {{ appointment.status }}
      </p>
      <div v-if="appointment.status === 'confirmed'" class="cluster">
        <BaseButton :disabled="busy" variant="outline" @click="active = appointment">
          Reschedule
        </BaseButton>
        <BaseButton
          :disabled="busy"
          variant="outline"
          @click="
            run(() =>
              appointments.change(
                appointment.id,
                'cancel',
                { version: appointment.version },
                key({ id: appointment.id, version: appointment.version, action: 'cancel' }),
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
</template>
