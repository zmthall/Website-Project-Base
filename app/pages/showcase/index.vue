<script setup lang="ts">
useSEO({ title: 'Component showcase', robots: { index: false, follow: false } });
const groups = [
  ['theme', 'Theme & packs'],
  ['primitives', 'Base components'],
  ['forms', 'Forms & validation'],
  ['business', 'Business & blocks'],
  ['media', 'Images & media'],
  ['article', 'Article & content'],
  ['system', 'System states'],
];
</script>
<template>
  <div class="container">
    <header class="section" style="padding-bottom: 0">
      <ContentEyebrow>The component library</ContentEyebrow>
      <h1 style="margin-block: 1rem">
        One foundation.
        <br />
        Room to make it yours.
      </h1>
      <p class="muted">
        Explore the theme, reusable components, and their interactive states. All content and
        submissions here are examples.
      </p>
      <div class="cluster" style="margin-top: 1.5rem">
        <NuxtLink to="/showcase/sections" class="btn" data-variant="primary">
          Explore section variants
          <BaseIcon />
        </NuxtLink>
        <NuxtLink to="/showcase/screens" class="btn" data-variant="outline">
          Feature screen examples
        </NuxtLink>
        <NuxtLink to="/" class="btn" data-variant="outline">View business demo</NuxtLink>
      </div>
    </header>
    <div class="showcase-layout">
      <nav class="showcase-sidebar" aria-label="Showcase sections">
        <a v-for="[id, label] in groups" :key="id" :href="`#${id}`">{{ label }}</a>
      </nav>
      <div>
        <section id="theme" class="showcase-group">
          <h2>Theme & packs</h2>
          <ShowcaseThemeControls />
        </section>
        <section id="primitives" class="showcase-group">
          <h2>Base components</h2>
          <ShowcasePrimitives />
        </section>
        <section id="forms" class="showcase-group">
          <h2>Forms & validation</h2>
          <ShowcaseForms />
        </section>
        <section id="business" class="showcase-group">
          <h2>Business & blocks</h2>
          <ShowcaseBusiness />
        </section>
        <section id="media" class="showcase-group">
          <h2>Images & media</h2>
          <ShowcaseMedia />
        </section>
        <section id="article" class="showcase-group">
          <h2>Article & content</h2>
          <ShowcaseArticle />
        </section>
        <section id="system" class="showcase-group stack">
          <h2>System states</h2>
          <SystemSuccessState />
          <SystemErrorState />
          <SystemLoadingState />
          <NavigationBreadCrumbs :items="[{ label: 'Home', to: '/' }, { label: 'Showcase' }]" />
          <NavigationPagination :page="1" :total-pages="12" />
        </section>
      </div>
    </div>
  </div>
</template>
