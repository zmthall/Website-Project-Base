<script setup lang="ts">
import type { TeamMember } from '../../../shared/types/team';
defineProps<{ member: TeamMember; expanded?: boolean }>();
</script>
<template>
  <BaseCard as="article">
    <MediaAppImage v-if="member.image" :image="member.image" class="media-frame" />
    <h3>{{ member.name }}</h3>
    <p class="eyebrow">{{ member.role }}</p>
    <p v-if="member.summary || member.biography" class="muted">
      {{ expanded ? (member.biography ?? member.summary) : member.summary }}
    </p>
    <ul v-if="member.credentials?.length">
      <li v-for="credential in member.credentials" :key="credential">{{ credential }}</li>
    </ul>
    <BusinessEmail v-if="member.contact?.email" :value="member.contact.email" />
    <NavigationSocialLinks v-if="member.socials" :links="member.socials" />
  </BaseCard>
</template>
