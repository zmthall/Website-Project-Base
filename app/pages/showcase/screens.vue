<script setup lang="ts">
import { contactForm, demoSection } from '../../data/demo';
import type { FormSchema } from '../../types/forms';
const active = ref('appointments');
const completed = ref(false);
const screens: Record<string, FormSchema> = {
  contact: contactForm,
  reviews: {
    id: 'reviews',
    title: 'Write an example review',
    submitLabel: 'Preview review',
    fields: [
      { name: 'name', label: 'Display name', type: 'text', required: true },
      {
        name: 'rating',
        label: 'Rating from 1 to 5',
        type: 'number',
        min: 1,
        max: 5,
        required: true,
      },
      { name: 'review', label: 'Your review', type: 'textarea', required: true },
    ],
  },
  appointments: {
    id: 'appointments',
    title: 'Book an example appointment',
    submitLabel: 'Preview appointment',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'date', label: 'Preferred date', type: 'date', required: true },
      { name: 'time', label: 'Preferred time', type: 'time', required: true },
    ],
  },
  estimates: {
    id: 'estimates',
    title: 'Request an example estimate',
    submitLabel: 'Preview request',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'project', label: 'About your project', type: 'textarea', required: true },
      { name: 'budget', label: 'Indicative budget', type: 'number', min: 0 },
    ],
  },
  events: {
    id: 'events',
    title: 'Example event registration',
    submitLabel: 'Preview registration',
    fields: [
      { name: 'name', label: 'Attendee name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      {
        name: 'count',
        label: 'Number of attendees',
        type: 'number',
        min: 1,
        max: 10,
        required: true,
      },
    ],
  },
  careers: {
    id: 'careers',
    title: 'Example application',
    submitLabel: 'Preview application',
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'introduction', label: 'Introduce yourself', type: 'textarea', required: true },
    ],
  },
  newsletter: {
    id: 'newsletter',
    title: 'Example newsletter subscription',
    submitLabel: 'Preview subscription',
    fields: [
      { name: 'email', label: 'Email address', type: 'email', required: true },
      {
        name: 'consent',
        label: 'I understand this is a demonstration.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
  auth: {
    id: 'auth',
    title: 'Example account access',
    submitLabel: 'Preview sign-in link',
    fields: [{ name: 'email', label: 'Email address', type: 'email', required: true }],
  },
  customer: {
    id: 'customer',
    title: 'Example profile settings',
    submitLabel: 'Preview profile',
    fields: [
      { name: 'name', label: 'Display name', type: 'text', required: true },
      { name: 'email', label: 'Contact email', type: 'email', required: true },
    ],
  },
};
const files = ref<File[]>([]);
const query = ref<string | number>('');
const results = computed(() => {
  const term = String(query.value).trim().toLowerCase();
  return term
    ? (demoSection.resources ?? []).filter((item) =>
        `${item.title} ${item.description ?? ''}`.toLowerCase().includes(term),
      )
    : [];
});
useSEO({ title: 'Feature screen examples', robots: { index: false, follow: false } });
</script>
<template>
  <section class="container section stack">
    <NavigationBreadCrumbs
      :items="[{ label: 'Showcase', to: '/showcase' }, { label: 'Feature screens' }]"
    />
    <h1>Everyday interactions.</h1>
    <BaseAlert title="UI demonstrations only">
      No appointments, accounts, subscriptions, applications, or payments are created. Use example
      information only.
    </BaseAlert>
    <label class="field" style="max-width: 24rem">
      Screen
      <select v-model="active" class="input" @change="completed = false">
        <option v-for="(_, id) in screens" :key="id" :value="id">{{ id }}</option>
        <option value="uploads">uploads</option>
        <option value="payments">payments</option>
        <option value="search">search</option>
      </select>
    </label>
    <div class="grid grid-2">
      <FormsDynamicForm
        v-if="screens[active]"
        :schema="screens[active]!"
        @submit="completed = true"
      />
      <FormsFileUpload v-else-if="active === 'uploads'" v-model="files" multiple />
      <BaseCard v-else-if="active === 'payments'">
        <h2 style="font-size: 1.5rem">Example order summary</h2>
        <p>Lorem ipsum service · $99.00</p>
        <p class="muted">
          A payment provider would securely collect payment information here. This template does not
          collect card details.
        </p>
        <BaseButton @click="completed = true">Preview checkout confirmation</BaseButton>
      </BaseCard>
      <div v-else class="stack">
        <label class="field">
          Search example resources
          <FormsSearch v-model="query" />
        </label>
        <p role="status" class="help">{{ results.length }} results</p>
        <BaseCard v-for="item in results" :key="item.id">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <BaseLink v-if="item.action" :action="item.action" />
        </BaseCard>
        <BaseEmptyState
          v-if="!results.length"
          :title="query ? 'No matching resources' : 'Start a search'"
        />
      </div>
      <SystemSuccessState
        v-if="completed"
        title="Example complete"
        message="The interface responded locally. Nothing was sent or saved."
      />
    </div>
  </section>
</template>
