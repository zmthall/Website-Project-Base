<script setup lang="ts">
// TODO [CAREER-01]: Define applicant retention/deletion, audited reviewer permissions and notifications; add private resume storage/scanning only when the upload adapter is ready. See docs/integration-audit.md.

import type { ManagedRecord } from '#shared/types/management';
const props = defineProps<{ openings: ManagedRecord[]; initialPosition?: string }>();
const emit = defineEmits<{ received: [id: string] }>();
const form = reactive({
  positionId: 'general',
  name: '',
  email: '',
  phone: '',
  location: '',
  employmentType: 'Either',
  startDate: '',
  availability: '',
  experience: '',
  education: '',
  portfolioUrl: '',
  source: '',
  website: '',
  accuracy: false,
  consent: false,
});
watch(
  () => props.initialPosition,
  (value) => {
    form.positionId = props.openings.some((job) => job.id === value) ? value! : 'general';
  },
  { immediate: true },
);
const busy = ref(false);
const error = ref('');
const options = computed(() => [
  { label: 'General application', value: 'general' },
  ...props.openings.map((job) => ({
    label: `${job.fields.title} · ${job.fields.location}`,
    value: job.id,
  })),
]);
async function submit() {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    const receipt = await $fetch<{ id: string }>('/api/careers/applications', {
      method: 'POST',
      body: { ...form, consent: { granted: form.consent } },
    });
    emit('received', receipt.id);
  } catch (e) {
    error.value =
      (e as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Your application could not be saved. Please try again.';
  } finally {
    busy.value = false;
  }
}
const personal = [
  { key: 'name', label: 'Full name', type: 'text', autocomplete: 'name' },
  { key: 'email', label: 'Email address', type: 'email', autocomplete: 'email' },
  { key: 'phone', label: 'Phone number', type: 'tel', autocomplete: 'tel' },
  { key: 'location', label: 'City and region', type: 'text', autocomplete: 'address-level2' },
] as const;
</script>
<template>
  <form class="stack careers-application" @submit.prevent="submit">
    <p v-if="error" role="alert" class="alert">{{ error }}</p>
    <fieldset :disabled="busy" class="stack">
      <legend>Personal information</legend>
      <FormsField v-slot="{ id }" label="Position" required>
        <FormsSelect :id="id" v-model="form.positionId" :options="options" required />
      </FormsField>
      <div class="grid grid-2">
        <FormsField
          v-for="field in personal"
          :key="field.key"
          v-slot="{ id }"
          :label="field.label"
          required
        >
          <FormsInput
            :id="id"
            v-model="form[field.key]"
            :type="field.type"
            :autocomplete="field.autocomplete"
            maxlength="254"
            required
          />
        </FormsField>
      </div>
    </fieldset>
    <fieldset :disabled="busy" class="stack">
      <legend>Work preferences</legend>
      <div class="grid grid-2">
        <FormsField v-slot="{ id }" label="Preferred employment type" required>
          <FormsSelect
            :id="id"
            v-model="form.employmentType"
            :options="
              ['Either', 'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'].map(
                (value) => ({ label: value, value }),
              )
            "
            required
          />
        </FormsField>
        <FormsField v-slot="{ id }" label="Available start date">
          <FormsDate :id="id" v-model="form.startDate" />
        </FormsField>
      </div>
      <FormsField
        v-slot="{ id, describedBy }"
        label="Availability"
        help="Tell us which days, hours, or shifts you can work."
        required
      >
        <FormsTextarea
          :id="id"
          v-model="form.availability"
          :aria-describedby="describedBy"
          rows="3"
          maxlength="10000"
          required
        />
      </FormsField>
    </fieldset>
    <fieldset :disabled="busy" class="stack">
      <legend>Experience and qualifications</legend>
      <FormsField
        v-slot="{ id, describedBy }"
        label="Relevant experience"
        help="Share your work history, skills, or projects. If this is your first role, tell us what you would like to learn."
        required
      >
        <FormsTextarea
          :id="id"
          v-model="form.experience"
          :aria-describedby="describedBy"
          rows="5"
          maxlength="10000"
          required
        />
      </FormsField>
      <FormsField v-slot="{ id }" label="Education and qualifications">
        <FormsTextarea :id="id" v-model="form.education" rows="3" maxlength="10000" />
      </FormsField>
      <FormsField
        v-slot="{ id, describedBy }"
        label="Portfolio or résumé link"
        help="Optional HTTPS link to materials you want to share. File uploads are not needed for this application."
      >
        <FormsURL
          :id="id"
          v-model="form.portfolioUrl"
          :aria-describedby="describedBy"
          maxlength="1000"
        />
      </FormsField>
      <FormsField v-slot="{ id }" label="How did you hear about us?">
        <FormsSelect
          :id="id"
          v-model="form.source"
          :options="[
            { label: 'Select an option (optional)', value: '' },
            ...['Website', 'Job board', 'Social media', 'Referral', 'Other'].map((value) => ({
              label: value,
              value,
            })),
          ]"
        />
      </FormsField>
    </fieldset>
    <fieldset :disabled="busy" class="stack">
      <legend>Review and submit</legend>
      <FormsAttestation v-model="form.accuracy" required />
      <FormsCheckbox
        v-model="form.consent"
        label="I agree to have my application information stored for the team to review and contact me."
        required
      />
      <NuxtLink to="/privacy">Read our privacy policy</NuxtLink>
      <div class="careers-honeypot" aria-hidden="true">
        <FormsInput
          v-model="form.website"
          tabindex="-1"
          autocomplete="off"
          aria-label="Leave this field empty"
        />
      </div>
      <BaseButton type="submit" :loading="busy">Submit application</BaseButton>
    </fieldset>
  </form>
</template>
