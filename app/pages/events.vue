<script setup lang="ts">
import type { CalendarEvent } from '../features/events/types';
import type { ManagedRecord } from '#shared/types/management';
import { publishedEventSchemas } from '../features/events/schema';
import { createDemoEvents } from '../features/events/demo';
useSEO({
  title: 'Events',
  description: 'Explore our calendar of community gatherings, workshops, and conversations.',
});
// Nuxt serializes the initial date so server and browser render the same month.
const today = useState('events-demo-today', () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()),
);
const { data: records, error, refresh } = await useFetch<ManagedRecord[]>('/api/content/events');
const events = computed(() =>
  records.value?.length
    ? records.value.map(
        (record) => ({ id: record.id, ...record.fields }) as unknown as CalendarEvent,
      )
    : error.value
      ? []
      : createDemoEvents(today.value),
);
useStructuredData(() => publishedEventSchemas(records.value ?? []), 'published-events');
</script>
<template>
  <div class="container section stack">
    <header class="stack">
      <ContentEyebrow>Come together</ContentEyebrow>
      <h1>Something to look forward to.</h1>
      <p class="muted">
        Explore gatherings, workshops, and conversations. Select an event to see the details.
      </p>
      <p v-if="!error && !records?.length" class="muted">
        Sample calendar · Events shown are illustrative.
      </p>
    </header>
    <p v-if="error" role="alert">
      Published events could not be loaded.
      <BaseButton variant="outline" @click="refresh()">Retry events</BaseButton>
    </p>
    <EventsCalendar :events="events" :today="today" />
  </div>
</template>
