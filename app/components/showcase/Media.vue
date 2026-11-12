<script setup lang="ts">
import { demoImages } from '../../data/demo';
</script>
<template>
  <div class="stack">
    <h3>Optimized images & gallery</h3>
    <MediaImageGallery :images="demoImages" />
    <h3>Before and after</h3>
    <MediaBeforeAfter :before="demoImages[0]!" :after="demoImages[1]!" />
    <h3>Responsive picture</h3>
    <MediaAppPicture :image="demoImages[0]!" :mobile="demoImages[1]" />
    <h3>Video embed</h3>
    <MediaVideoEmbed
      :video="{
        kind: 'video-embed',
        provider: 'youtube',
        videoId: 'aqz-KE-bpKQ',
        title: 'Sample video: Big Buck Bunny',
        poster: demoImages[0],
      }"
    />
    <h3>PDF document</h3>
    <ContentEmbeddedPDF
      src="/example-guide.pdf"
      title="Example guide"
      description="A sample download to demonstrate document controls."
    />
  </div>
</template>
