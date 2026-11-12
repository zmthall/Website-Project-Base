<script setup lang="ts">
import { careers } from '#shared/data/careers';
import type { ManagedRecord } from '#shared/types/management';
useSEO({
  title: 'Apply to join our team',
  description: 'Share your experience, interests, and availability with our team.',
});
const route = useRoute();
const { data: openings, error, refresh } = await useFetch<ManagedRecord[]>('/api/content/jobs');
const position = computed(() =>
  typeof route.query.position === 'string'
    ? route.query.position
    : typeof route.query.select === 'string'
      ? route.query.select
      : 'general',
);
const validPosition = computed(
  () =>
    position.value === 'general' || (openings.value ?? []).some((job) => job.id === position.value),
);
const accepted = ref(false);
const noticeOpen = ref(false);
const acknowledged = ref(false);
const receipt = ref('');
const confirmation = ref<HTMLElement>();
onMounted(() => {
  noticeOpen.value = true;
});
async function received(id: string) {
  receipt.value = id;
  await nextTick();
  confirmation.value?.focus();
}
function continueApplication() {
  if (!acknowledged.value) return;
  accepted.value = true;
  noticeOpen.value = false;
}
</script>
<template>
  <div class="container section stack careers-apply-page">
    <NuxtLink to="/careers">← Back to careers</NuxtLink>
    <header class="stack">
      <ContentEyebrow>Your next chapter</ContentEyebrow>
      <h1>Tell us about yourself.</h1>
      <p class="muted">
        Choose your opportunity and share the experience you would bring to our team.
      </p>
    </header>
    <section
      v-if="receipt"
      ref="confirmation"
      class="careers-panel stack"
      tabindex="-1"
      aria-labelledby="application-received"
    >
      <h2 id="application-received">Application received.</h2>
      <p>
        Thank you for introducing yourself. Your application has been saved for our team to review.
      </p>
      <p class="muted">Reference: {{ receipt }}</p>
      <NuxtLink to="/careers" class="btn" data-variant="primary">Back to careers</NuxtLink>
    </section>
    <section v-else-if="error" class="careers-panel stack" role="alert">
      <h2>We could not load the application.</h2>
      <p>Please try again before submitting.</p>
      <BaseButton @click="refresh()">Retry application</BaseButton>
    </section>
    <template v-else-if="accepted">
      <p v-if="!validPosition" role="status" class="alert">
        That opening is no longer available. You can choose another opening or submit a general
        application.
      </p>
      <CareersApplication
        :openings="openings ?? []"
        :initial-position="position"
        @received="received"
      />
    </template>
    <section v-else class="careers-panel stack">
      <h2>Before you apply</h2>
      <p>{{ careers.notice }}</p>
      <BaseButton @click="noticeOpen = true">Review application notice</BaseButton>
    </section>
    <BaseModal
      v-model:open="noticeOpen"
      title="Before you apply"
      description="Please review how this application works."
    >
      <div class="stack">
        <p>{{ careers.notice }}</p>
        <p>
          Your application is saved for administrator review. Our team can use your contact details
          to discuss suitable opportunities.
        </p>
        <NuxtLink to="/privacy">Read our privacy policy</NuxtLink>
        <FormsCheckbox
          v-model="acknowledged"
          label="I have read and understand the application notice."
        />
        <div class="cluster">
          <BaseButton :disabled="!acknowledged" @click="continueApplication">
            Continue to application
          </BaseButton>
          <NuxtLink to="/careers" @click="noticeOpen = false">Back to careers</NuxtLink>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
