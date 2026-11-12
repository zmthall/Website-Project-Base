<script setup lang="ts">
import type { NuxtError } from '#app';
defineProps<{ error: NuxtError }>();
</script>
<template>
  <main class="container section" style="max-width: 42rem">
    <div class="stack">
      <p class="eyebrow">{{ error.statusCode }}</p>
      <h1>{{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}</h1>
      <p class="muted">Please return to the home page and try again.</p>
      <div><BaseButton @click="clearError({ redirect: '/' })">Return home</BaseButton></div>
    </div>
  </main>
</template>
