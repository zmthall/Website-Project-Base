<script setup lang="ts">
// TODO [PRIVACY-01]: Replace template policies with accurate client-approved disclosures covering actual data collection, processors, retention/deletion and consent; never claim forms are browser-only. See docs/integration-audit.md.

useSEO({ title: 'Privacy information', robots: { index: false, follow: false } });
</script>
<template>
  <article class="container section stack" style="max-width: 50rem">
    <h1>Privacy information</h1>
    <BaseAlert title="Demonstration content">
      This is a template page, not a completed legal policy. Replace it before publishing a client
      website.
    </BaseAlert>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua.
    </p>
    <p>
      Enabled forms can send information to this website’s server. Local account and CMS records may
      persist, while demo workflow records reset when the server restarts. External maps and videos
      load only after you choose to load them.
    </p>
  </article>
</template>
