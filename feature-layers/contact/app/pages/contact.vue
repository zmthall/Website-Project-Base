<script setup lang="ts">
import type { FormValue, FormSchema } from '../../../../app/types/forms';
import { contactForm } from '../features/contact/form';

useSEO({ title: 'Contact', description: 'Explore our contact form and ways to get in touch.' });
const submitted = ref(false);
const contactFormElement = ref<HTMLElement>();
watch(submitted, async (open) => {
  if (!open) {
    await nextTick();
    contactFormElement.value?.querySelector<HTMLButtonElement>('button[type=submit]')?.focus();
  }
});
const busy = ref(false);
const error = ref('');
async function submit(values: Record<string, FormValue>) {
  busy.value = true;
  error.value = '';
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: values.name,
        email: values.email,
        reason: values.topic,
        message: values.message,
        consent: { granted: values.consent === true },
      },
    });
    submitted.value = true;
  } catch {
    error.value = 'Your message could not be saved. Please try again.';
  } finally {
    busy.value = false;
  }
}
const schema: FormSchema = {
  ...contactForm,
  id: 'contact-page-demo',
  title: 'Your message',
  description: 'Your message is saved for our team to review.',
  submitLabel: 'Send message',
  fields: contactForm.fields.map((field) =>
    field.name === 'consent'
      ? { ...field, label: 'I agree to have my information stored to respond to this message.' }
      : field.name === 'topic'
        ? {
            ...field,
            options: [
              ...(field.options ?? []),
              { label: 'Report an issue', value: 'issue' },
              { label: 'Something else', value: 'other' },
            ],
          }
        : field,
  ),
};
</script>
<template>
  <div class="container section stack">
    <header class="stack">
      <ContentEyebrow>Contact</ContentEyebrow>
      <h1>Let’s start a conversation.</h1>
      <p class="muted">
        A question, an idea, or something we can help with? Explore the form below.
      </p>
    </header>
    <div class="grid grid-2">
      <section class="stack" aria-labelledby="contact-info">
        <h2 id="contact-info">A few ways to reach us.</h2>
        <BusinessContactMethods />
        <p class="muted">
          Contact details are template examples. Messages are saved in the administrator inbox.
        </p>
        <BaseLink
          :action="{ type: 'route', to: '/estimates', label: 'Explore an estimate request' }"
        />
        <BaseLink
          :action="{ type: 'route', to: '/appointments', label: 'Prefer an appointment?' }"
        />
      </section>
      <section ref="contactFormElement" class="stack" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading">Send us a message</h2>
        <p v-if="error" role="alert">{{ error }}</p>
        <FormsDynamicForm :schema="schema" :busy="busy" @submit="submit" />
      </section>
    </div>
    <BaseModal
      v-model:open="submitted"
      title="Message received"
      description="Your message has been saved for our team."
    >
      <p>Thank you for getting in touch.</p>
      <BaseButton variant="outline" style="margin-top: 1rem" @click="submitted = false">
        Back to form
      </BaseButton>
    </BaseModal>
  </div>
</template>
