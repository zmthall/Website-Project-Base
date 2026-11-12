<script setup lang="ts">
import { demoSection } from '../../data/demo';
useSEO({ title: 'Resources & ideas' });
</script>
<template>
  <div>
    <SectionsHeroMinimal :data="{ ...demoSection, title: 'Ideas worth sharing.' }" />
    <SectionsArticlesGrid :data="{ ...demoSection, title: 'From our journal' }" />
  </div>
</template>
