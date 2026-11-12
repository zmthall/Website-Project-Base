<script setup lang="ts">
import type { TrustItem } from '../../types/blocks';
defineProps<{ award: TrustItem }>();
</script>
<template>
  <BaseCard>
    <BlocksTrustItem :item="award" />
    <p v-if="award.issuer || award.year" class="help">{{ award.issuer }} · {{ award.year }}</p>
  </BaseCard>
</template>
