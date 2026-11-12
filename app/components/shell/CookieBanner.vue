<script setup lang="ts">
// TODO [PRIVACY-01]: Replace template policies with accurate client-approved disclosures covering actual data collection, processors, retention/deletion and consent; never claim forms are browser-only. See docs/integration-audit.md.

withDefaults(defineProps<{ enabled?: boolean }>(), { enabled: false });
const consent = useCookie<'accepted' | 'rejected' | null>('demo-consent', {
  default: () => null,
  sameSite: 'lax',
  maxAge: 31536000,
});
defineEmits<{ change: [value: 'accepted' | 'rejected'] }>();
</script>
<template>
  <aside v-if="enabled && !consent" class="card cookie-banner" aria-label="Cookie preferences">
    <h3>Your preferences</h3>
    <p class="help">
      This demo uses essential preference cookies only. Optional cookies are not loaded.
    </p>
    <details>
      <summary>Cookie details</summary>
      <p class="help">
        Theme and consent preferences are stored on this device. No analytics or advertising is
        enabled.
      </p>
    </details>
    <div class="cluster">
      <BaseButton
        variant="outline"
        @click="
          consent = 'rejected';
          $emit('change', 'rejected');
        "
      >
        Essential only
      </BaseButton>
      <BaseButton
        @click="
          consent = 'accepted';
          $emit('change', 'accepted');
        "
      >
        Accept preferences
      </BaseButton>
    </div>
  </aside>
</template>
