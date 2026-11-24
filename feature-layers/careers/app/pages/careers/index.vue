<script setup lang="ts">
import { careers } from '../../data/careers';
import type { ManagedRecord } from '#shared/types/management';
useSEO({ title: 'Careers', description: careers.introduction });
const {
  data: openings,
  status,
  error,
  refresh,
} = await useFetch<ManagedRecord[]>('/api/content/jobs');
const contactEnabled = useFeature('contact');
const department = ref('');
const departments = computed(() =>
  [...new Set((openings.value ?? []).map((job) => String(job.fields.department)))].sort(),
);
const visible = computed(() =>
  (openings.value ?? []).filter(
    (job) => !department.value || job.fields.department === department.value,
  ),
);
const selected = ref<ManagedRecord>();
const detailsOpen = ref(false);
function details(job: ManagedRecord) {
  selected.value = job;
  detailsOpen.value = true;
}
const lines = (value: unknown) =>
  String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
</script>
<template>
  <div class="careers-page">
    <section class="container section careers-hero">
      <div class="stack">
        <ContentEyebrow>Careers · Join our team</ContentEyebrow>
        <h1>{{ careers.headline }}</h1>
        <p class="careers-lead muted">{{ careers.introduction }}</p>
        <div class="cluster">
          <NuxtLink to="#opportunities" class="btn" data-variant="primary">
            Explore opportunities
          </NuxtLink>
          <NuxtLink to="/careers/apply" class="btn" data-variant="outline">
            Send an application
          </NuxtLink>
        </div>
      </div>
      <aside class="careers-panel stack">
        <ContentEyebrow>Your next chapter</ContentEyebrow>
        <h2>Bring what makes you, you.</h2>
        <p>
          Practical experience. A fresh perspective. A willingness to learn. Tell us what you would
          bring to the team.
        </p>
        <NuxtLink to="/about">Get to know us →</NuxtLink>
      </aside>
    </section>
    <section class="container section stack" aria-labelledby="why-join">
      <ContentEyebrow>Work that matters</ContentEyebrow>
      <h2 id="why-join">A place to contribute and grow.</h2>
      <div class="grid grid-3">
        <article v-for="value in careers.values" :key="value.title" class="careers-panel stack">
          <h3>{{ value.title }}</h3>
          <p class="muted">{{ value.description }}</p>
        </article>
      </div>
    </section>
    <section id="opportunities" class="container section stack" aria-labelledby="openings-heading">
      <ContentEyebrow>Find your next step</ContentEyebrow>
      <h2 id="openings-heading">Current opportunities.</h2>
      <p class="muted">Choose a role to read the details, or send a general application.</p>
      <FormsField v-if="departments.length > 1" v-slot="{ id }" label="Department">
        <FormsSelect
          :id="id"
          v-model="department"
          :options="[
            { label: 'All departments', value: '' },
            ...departments.map((value) => ({ label: value, value })),
          ]"
        />
      </FormsField>
      <div v-if="error" class="stack" role="alert">
        <p>We could not load the openings. Please try again.</p>
        <BaseButton variant="outline" @click="refresh()">Retry openings</BaseButton>
      </div>
      <p v-else-if="status === 'pending'" role="status">Loading opportunities…</p>
      <div v-else-if="visible.length" class="grid grid-2">
        <article v-for="job in visible" :key="job.id" class="careers-panel stack">
          <ContentEyebrow>{{ job.fields.department }}</ContentEyebrow>
          <h3>{{ job.fields.title }}</h3>
          <p class="muted">{{ job.fields.location }} · {{ job.fields.employmentType }}</p>
          <p class="job-summary">{{ job.fields.description }}</p>
          <div class="cluster">
            <BaseButton
              variant="outline"
              :aria-label="`Job details: ${job.fields.title}`"
              @click="details(job)"
            >
              Job details
            </BaseButton>
            <NuxtLink
              :to="{ path: '/careers/apply', query: { position: job.id } }"
              class="btn"
              data-variant="primary"
              :aria-label="`Apply for ${job.fields.title}`"
            >
              Apply now
            </NuxtLink>
          </div>
        </article>
      </div>
      <BaseEmptyState
        v-else
        title="No openings listed right now"
        description="You can still introduce yourself with a general application."
      >
        <NuxtLink to="/careers/apply" class="btn" data-variant="primary">
          General application
        </NuxtLink>
      </BaseEmptyState>
    </section>
    <section class="careers-band">
      <div class="container section stack">
        <ContentEyebrow>What comes next</ContentEyebrow>
        <h2>A simple way to get started.</h2>
        <ol class="careers-steps grid grid-3">
          <li v-for="(step, index) in careers.steps" :key="step.title" class="stack">
            <span class="careers-step-number">0{{ index + 1 }}</span>
            <h3>{{ step.title }}</h3>
            <p class="muted">{{ step.description }}</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="container section careers-hero">
      <div class="stack">
        <ContentEyebrow>Start a conversation</ContentEyebrow>
        <h2>Don’t see your perfect role?</h2>
        <p class="muted">
          Share your experience and interests. A general application helps us get to know you.
        </p>
      </div>
      <div class="stack">
        <NuxtLink to="/careers/apply" class="btn" data-variant="primary">
          Introduce yourself
        </NuxtLink>
        <NuxtLink v-if="contactEnabled" to="/contact">Have a question? Contact us</NuxtLink>
      </div>
    </section>
    <BaseModal
      v-model:open="detailsOpen"
      :title="String(selected?.fields.title || 'Job details')"
      :description="`${selected?.fields.location || ''} · ${selected?.fields.employmentType || ''}`"
    >
      <div v-if="selected" class="stack">
        <section class="stack">
          <h3>About the role</h3>
          <p class="careers-preserve">{{ selected.fields.description }}</p>
        </section>
        <section v-if="selected.fields.responsibilities" class="stack">
          <h3>Responsibilities</h3>
          <ul>
            <li v-for="line in lines(selected.fields.responsibilities)" :key="line">{{ line }}</li>
          </ul>
        </section>
        <section v-if="selected.fields.shifts" class="stack">
          <h3>Shifts</h3>
          <ul>
            <li v-for="line in lines(selected.fields.shifts)" :key="line">{{ line }}</li>
          </ul>
        </section>
        <section v-if="selected.fields.requirements" class="stack">
          <h3>Qualifications</h3>
          <ul>
            <li v-for="line in lines(selected.fields.requirements)" :key="line">{{ line }}</li>
          </ul>
        </section>
        <section v-if="selected.fields.benefits" class="stack">
          <h3>Benefits and compensation</h3>
          <ul>
            <li v-for="line in lines(selected.fields.benefits)" :key="line">{{ line }}</li>
          </ul>
        </section>
        <NuxtLink
          :to="{ path: '/careers/apply', query: { position: selected.id } }"
          class="btn"
          data-variant="primary"
          @click="detailsOpen = false"
        >
          Apply for this role
        </NuxtLink>
      </div>
    </BaseModal>
  </div>
</template>
