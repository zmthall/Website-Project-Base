<script setup lang="ts">
// TODO [BOOK-02]: Add explicit cancellation confirmation/policies, account prefill, refreshed day boundaries and recovery for changed staff/service availability without losing entered details. See docs/integration-audit.md.

import { appointments, appointmentWorkflow } from '../features/appointments';
import { zonedDate } from '#shared/utils/scheduling';
import type { TimeSlot, Appointment } from '../features/appointments';
useSEO({ title: 'Appointments', description: 'Explore the local scheduling workflow.' });
const { appointments: api, auth } = useWorkflows();
const key = useWorkflowKey();
const today = useState('booking-today', () => zonedDate(Date.now(), appointments.timeZone));
const form = reactive({
  service: 'introduction',
  meeting: 'video',
  date: today.value,
  time: '',
  location: 'remote',
  provider: 'team',
  name: '',
  email: '',
  phone: '',
  notes: '',
  consent: false,
});
const slots = ref<TimeSlot[]>([]);
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const availabilityError = ref('');
const booked = ref<Appointment>();
const notice = ref<HTMLElement>();
let revision = 0;
let controller: AbortController | undefined;
const formatTime = (instant: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: appointments.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(instant));
const timeOptions = computed(() =>
  slots.value.map((slot) => ({
    value: formatTime(slot.startsAt),
    label: formatTime(slot.startsAt),
  })),
);
async function load() {
  if (!import.meta.client) return;
  const current = ++revision;
  controller?.abort();
  controller = new AbortController();
  loading.value = true;
  availabilityError.value = '';
  form.time = '';
  try {
    const result = await api.availability(
      { date: form.date, service: form.service, location: form.location, provider: form.provider },
      controller.signal,
    );
    if (current === revision) slots.value = result;
  } catch (e) {
    if (current === revision) {
      slots.value = [];
      availabilityError.value =
        (e as { data?: { statusMessage?: string } }).data?.statusMessage ||
        'Availability could not be loaded.';
    }
  } finally {
    if (current === revision) loading.value = false;
  }
}
watch(() => [form.date, form.service, form.location, form.provider], load);
watch(
  () => form.meeting,
  (value) => {
    form.location = value === 'in-person' ? 'office' : 'remote';
  },
);
onMounted(load);
onBeforeUnmount(() => {
  revision++;
  controller?.abort();
});
async function submit() {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  const body = {
    service: form.service,
    date: form.date,
    time: form.time,
    location: form.location,
    provider: form.provider,
    meeting: form.meeting,
    contact: { name: form.name, email: form.email, phone: form.phone },
    notes: form.notes,
    consent: form.consent as true,
  };
  try {
    booked.value = await api.book(body, key(body));
    await nextTick();
    notice.value?.focus();
  } catch (e) {
    error.value =
      (e as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Booking failed. Your details are kept so you can retry.';
    await load();
    await nextTick();
    notice.value?.focus();
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <div class="container section stack">
    <header class="stack">
      <ContentEyebrow>Appointments · Local simulation</ContentEyebrow>
      <h1>Make time for a conversation.</h1>
      <p class="muted">
        Test bookings in {{ appointments.timeZone }}. Demo records reset when the server restarts;
        no real appointment or email is sent.
      </p>
    </header>
    <section v-if="booked" ref="notice" tabindex="-1" class="stack" role="status">
      <h2>Demo appointment confirmed</h2>
      <p>
        {{ new Date(booked.startsAt).toLocaleString('en-US', { timeZone: booked.timeZone }) }} ·
        {{ booked.timeZone }}
      </p>
      <p>Reference: {{ booked.id }}</p>
      <NuxtLink to="/customer/workflows">View, reschedule or cancel</NuxtLink>
      <BaseButton
        variant="outline"
        @click="
          booked = undefined;
          load();
        "
      >
        Book another demo
      </BaseButton>
    </section>
    <template v-else>
      <p v-if="!auth.isAuthenticated.value">
        Sign in to keep appointment records private.
        <NuxtLink to="/customer/login">Customer sign in</NuxtLink>
      </p>
      <p v-if="error" ref="notice" tabindex="-1" role="alert" class="alert">{{ error }}</p>
      <form class="stack" @submit.prevent="submit">
        <fieldset class="stack" :disabled="busy">
          <legend>Your appointment</legend>
          <div class="grid grid-2">
            <FormsField v-slot="{ id }" label="Appointment type" required>
              <FormsSelect
                :id="id"
                v-model="form.service"
                :options="appointments.services"
                required
              />
            </FormsField>
            <FormsField v-slot="{ id }" label="Meeting format" required>
              <FormsSelect
                :id="id"
                v-model="form.meeting"
                :options="appointments.meetingTypes"
                required
              />
            </FormsField>
            <FormsField v-slot="{ id }" label="Location" required>
              <FormsSelect
                :id="id"
                v-model="form.location"
                :options="
                  appointmentWorkflow.locations.filter((l) =>
                    form.meeting === 'in-person' ? l.value === 'office' : l.value === 'remote',
                  )
                "
                required
              />
            </FormsField>
            <FormsField v-slot="{ id }" label="Provider" required>
              <FormsSelect
                :id="id"
                v-model="form.provider"
                :options="
                  appointmentWorkflow.providers.filter((p) =>
                    p.locations.includes(form.location),
                  )
                "
                required
              />
            </FormsField>
            <FormsField v-slot="{ id }" label="Preferred date" required>
              <FormsDate :id="id" v-model="form.date" :min="today" required />
            </FormsField>
            <FormsField
              v-slot="{ id }"
              label="Available time"
              :help="`Times in ${appointments.timeZone}`"
              required
            >
              <FormsSelect
                :id="id"
                v-model="form.time"
                :options="timeOptions"
                placeholder="Choose a time"
                :disabled="loading || !slots.length"
                required
              />
            </FormsField>
          </div>
          <p role="status" aria-live="polite">
            {{
              loading
                ? 'Loading availability…'
                : availabilityError ||
                  (slots.length
                    ? `${slots.length} times available.`
                    : 'No times available. Choose another date.')
            }}
          </p>
          <BaseButton v-if="availabilityError" variant="outline" @click="load">
            Retry availability
          </BaseButton>
          <FormsField v-slot="{ id }" label="Full name" required>
            <FormsInput :id="id" v-model="form.name" autocomplete="name" maxlength="200" required />
          </FormsField>
          <FormsField v-slot="{ id }" label="Email address" required>
            <FormsEmail :id="id" v-model="form.email" autocomplete="email" required />
          </FormsField>
          <FormsField v-slot="{ id }" label="Phone number" :required="form.meeting === 'phone'">
            <FormsPhone :id="id" v-model="form.phone" :required="form.meeting === 'phone'" />
          </FormsField>
          <FormsField v-slot="{ id }" label="Anything we should know?">
            <FormsTextarea :id="id" v-model="form.notes" maxlength="10000" />
          </FormsField>
          <FormsCheckbox
            v-model="form.consent"
            required
            label="I understand this is a server-memory demo, not a real booking."
          />
          <BaseButton
            type="submit"
            :loading="busy"
            :disabled="!auth.isAuthenticated.value || loading || !form.time"
          >
            Confirm demo appointment
          </BaseButton>
        </fieldset>
      </form>
    </template>
  </div>
</template>
