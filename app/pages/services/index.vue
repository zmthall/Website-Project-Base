<script setup lang="ts">
import { demoSection } from '../../data/demo';
useSEO({ title: 'Services' });
</script>
<template>
  <div>
    <SectionsHeroMinimal
      :data="{ ...demoSection, title: 'A thoughtful approach to your next chapter.' }"
    />
    <SectionsServicesCards
      :data="{ ...demoSection, id: 'services', title: 'Our services', eyebrow: 'What we do' }"
    />
  </div>
</template>
