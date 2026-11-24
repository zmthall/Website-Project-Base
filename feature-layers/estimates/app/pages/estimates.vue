<script setup lang="ts">
// TODO [EST-02]: Persist Estimate creation and upload-claim retention in one durable transaction before production deployment. See docs/integration-audit.md.

import { estimates } from '../../shared/estimates';
import type { FormSchema, FormValue } from '../../../../app/types/forms';
useSEO({
  title: 'Request an estimate',
  description: 'Explore the estimate request demonstration and outline your project.',
});
const { estimates: api, auth } = useWorkflows();
const mutationKey = useWorkflowKey();
const { data: capabilities } = await useFetch<{ uploads: boolean }>('/api/workflows/capabilities');
const uploadIds = ref<string[]>([]);
const uploading = ref(false);
const busy = ref(false);
const error = ref('');
const reference = ref('');
const open = ref(false);
const preview = ref<Record<string, FormValue>>({});
const schema: FormSchema = {
  id: 'estimate-request-demo',
  title: 'Tell us about your project',
  description:
    'Requests are stored in server memory until restart. No quote is calculated or email sent.',
  submitLabel: 'Send demo estimate request',
  fields: [
    {
      name: 'service',
      label: 'Project type',
      type: 'select',
      required: true,
      options: estimates.services,
    },
    {
      name: 'description',
      label: 'Project details',
      type: 'textarea',
      required: true,
      minLength: 20,
      help: 'Describe what you would like to achieve and any requirements.',
    },
    {
      name: 'budget',
      label: 'Budget preference',
      type: 'select',
      required: true,
      options: estimates.budgets,
      help: 'A planning preference only, not a price or quote.',
    },
    {
      name: 'timeline',
      label: 'Preferred timeline',
      type: 'select',
      required: true,
      options: estimates.timelines,
    },
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'company', label: 'Company (optional)', type: 'text' },
    { name: 'email', label: 'Email address', type: 'email', required: true },
    {
      name: 'consent',
      label: 'I understand this request is stored temporarily in a local simulation.',
      type: 'checkbox',
      required: true,
    },
  ],
};
async function showPreview(values: Record<string, FormValue>) {
  if (busy.value || uploading.value) return;
  busy.value = true;
  error.value = '';
  const body = {
    service: String(values.service),
    description: String(values.description),
    budget: String(values.budget),
    timeline: String(values.timeline),
    contact: { name: String(values.name), email: String(values.email) },
    company: String(values.company || ''),
    consent: values.consent as true,
    uploadIds: uploadIds.value,
  };
  try {
    const record = await api.request(body, mutationKey(body));
    reference.value = record.id;
    preview.value = values;
    open.value = true;
  } catch (e) {
    error.value =
      (e as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Request could not be saved. Please retry.';
  } finally {
    busy.value = false;
  }
}
function label(options: { value: string; label: string }[], value: FormValue | undefined) {
  return options.find((option) => option.value === value)?.label ?? '';
}
</script>
<template>
  <div class="container section stack">
    <header class="stack">
      <ContentEyebrow>Estimates · Demo</ContentEyebrow>
      <h1>A clearer picture of your next project.</h1>
      <p class="muted">
        Outline your ideas, priorities, and timing. Explore an example request in a local estimate
        workflow.
      </p>
    </header>
    <div class="grid grid-2">
      <section class="stack" aria-labelledby="estimate-info">
        <h2 id="estimate-info">Start with the essentials.</h2>
        <p>
          You do not need every detail figured out. A little context helps start a useful
          conversation.
        </p>
        <ol class="stack">
          <li>Choose a project type and describe your goals.</li>
          <li>Share your budget and timing preferences.</li>
          <li>Review your example request.</li>
        </ol>
        <p class="muted">
          This demo does not calculate a quote, promise a price, or collect a deposit. Requests
          reset on server restart; no email is sent.
        </p>
        <BaseLink :action="{ type: 'route', to: '/contact', label: 'Have a question first?' }" />
      </section>
      <section class="stack" aria-labelledby="estimate-form-heading">
        <h2 id="estimate-form-heading">Try the estimate form</h2>
        <p v-if="!auth.isAuthenticated.value">
          Please
          <NuxtLink to="/customer/login">sign in</NuxtLink>
          to submit and privately review requests.
        </p>
        <p v-if="error" class="alert" role="alert">{{ error }}</p>
        <FormsEstimateAttachments
          v-if="auth.isAuthenticated.value && capabilities?.uploads"
          v-model="uploadIds"
          v-model:pending="uploading"
        />
        <FormsDynamicForm
          v-if="auth.isAuthenticated.value"
          :schema="schema"
          :busy="busy || uploading"
          @submit="showPreview"
        />
      </section>
    </div>
    <BaseModal
      v-model:open="open"
      title="Demo estimate request received"
      description="Saved in server memory. This is not a quote or a confirmed price."
    >
      <p>Reference: {{ reference }}</p>
      <NuxtLink to="/customer/workflows">View estimates and decisions</NuxtLink>
      <dl class="stack estimate-preview">
        <div>
          <dt>Project type</dt>
          <dd>{{ label(estimates.services, preview.service) }}</dd>
        </div>
        <div>
          <dt>Project details</dt>
          <dd class="project-description">{{ preview.description }}</dd>
        </div>
        <div>
          <dt>Budget preference</dt>
          <dd>{{ label(estimates.budgets, preview.budget) }}</dd>
        </div>
        <div>
          <dt>Preferred timeline</dt>
          <dd>{{ label(estimates.timelines, preview.timeline) }}</dd>
        </div>
      </dl>
      <BaseButton variant="outline" style="margin-top: 1rem" @click="open = false">
        Back to form
      </BaseButton>
    </BaseModal>
  </div>
</template>
<style scoped>
.estimate-preview dt {
  font-size: 0.85rem;
  color: var(--muted);
}
.estimate-preview dd {
  margin: 0.25rem 0 0;
  overflow-wrap: anywhere;
}
.project-description {
  white-space: pre-wrap;
  max-height: 12rem;
  overflow: auto;
}
</style>
