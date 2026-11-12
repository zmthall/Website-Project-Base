<script setup lang="ts">
import { demoSection } from '../data/demo';
useSEO({ title: 'About us' });
</script>
<template>
  <div>
    <SectionsHeroSplit :data="{ ...demoSection, title: 'Good people. Considered work.' }" />
    <SectionsTeamGrid :data="{ ...demoSection, title: 'Meet the people behind the work' }" />
    <SectionsAboutTimeline :data="{ ...demoSection, title: 'A story, one step at a time' }" />
  </div>
</template>
