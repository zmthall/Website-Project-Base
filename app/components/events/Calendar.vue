<script setup lang="ts">
// TODO [EVENT-01]: Only after explicit opt-in, add owner-checked registrations, transactional capacity/waitlists and cancellation/refund rules; do not infer registration from published calendar entries. See docs/integration-audit.md.

import type { CalendarEvent } from '../../features/events/types';
const props = defineProps<{ events: CalendarEvent[]; today: string }>();
const month = ref(props.today.slice(0, 7));
const category = ref('All events');
const selected = ref<CalendarEvent>();
const open = ref(false);
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const categories = computed(() => [
  'All events',
  ...new Set(props.events.map((event) => event.category)),
]);
const heading = computed(() =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${month.value}-01T00:00:00Z`),
  ),
);
const visibleEvents = computed(() =>
  props.events
    .filter(
      (event) =>
        event.date.startsWith(month.value) &&
        (category.value === 'All events' || category.value === event.category),
    )
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
);
const days = computed(() => {
  const first = new Date(`${month.value}-01T00:00:00Z`);
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((first.getUTCDay() + count) / 7) * 7 }, (_, index) => {
    const date = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), index - first.getUTCDay() + 1),
    )
      .toISOString()
      .slice(0, 10);
    return {
      date,
      number: Number(date.slice(-2)),
      current: date.startsWith(month.value),
      events: visibleEvents.value.filter((event) => event.date === date),
    };
  });
});
function move(amount: number) {
  const date = new Date(`${month.value}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  month.value = date.toISOString().slice(0, 7);
}
function show(event: CalendarEvent) {
  selected.value = event;
  open.value = true;
}
function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
function time(value: string) {
  const [hour, minute] = value.split(':');
  return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) < 12 ? 'AM' : 'PM'}`;
}
</script>
<template>
  <section class="event-calendar stack" aria-label="Events calendar">
    <div class="calendar-toolbar">
      <div class="calendar-controls">
        <BaseButton variant="outline" aria-label="Previous month" @click="move(-1)">←</BaseButton>
        <h2 aria-live="polite" aria-atomic="true">{{ heading }}</h2>
        <BaseButton variant="outline" aria-label="Next month" @click="move(1)">→</BaseButton>
        <BaseButton variant="ghost" @click="month = today.slice(0, 7)">Today</BaseButton>
      </div>
      <label class="calendar-filter">
        Category
        <select v-model="category" aria-label="Category">
          <option v-for="item in categories" :key="item">{{ item }}</option>
        </select>
      </label>
    </div>
    <p class="muted">
      {{ visibleEvents.length }} events this month · Times are shown in each event’s local timezone.
    </p>
    <div class="calendar-month">
      <div class="calendar-weekdays" aria-hidden="true">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>
      <div class="calendar-days">
        <div
          v-for="day in days"
          :key="day.date"
          class="calendar-day"
          :class="{ 'outside-month': !day.current }"
        >
          <time
            :datetime="day.date"
            :aria-label="dateLabel(day.date)"
            :aria-current="day.date === today ? 'date' : undefined"
            class="calendar-date"
          >
            {{ day.number }}
          </time>
          <button
            v-for="event in day.events"
            :key="event.id"
            type="button"
            class="calendar-event"
            :aria-label="`${event.title}, ${dateLabel(event.date)}, ${time(event.startTime)}`"
            @click="show(event)"
          >
            <span class="calendar-event-time">{{ time(event.startTime) }}</span>
            <strong>{{ event.title }}</strong>
            <span>{{ event.category }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="calendar-agenda stack">
      <button
        v-for="event in visibleEvents"
        :key="event.id"
        type="button"
        class="calendar-agenda-item"
        @click="show(event)"
      >
        <span>{{ dateLabel(event.date) }}</span>
        <strong>{{ event.title }}</strong>
        <span>{{ time(event.startTime) }} · {{ event.category }}</span>
      </button>
    </div>
    <BaseEmptyState
      v-if="!visibleEvents.length"
      title="No events this month"
      description="Try another month or choose a different category."
    />
    <BaseModal v-model:open="open" :title="selected?.title" :description="selected?.description">
      <dl v-if="selected" class="event-details">
        <div>
          <dt>Date</dt>
          <dd>{{ dateLabel(selected.date) }}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>
            {{ time(selected.startTime) }}–{{ time(selected.endTime) }}
            <br />
            {{ selected.timeZone }}
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{{ selected.location }}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{{ selected.category }}</dd>
        </div>
      </dl>
    </BaseModal>
  </section>
</template>
<style scoped>
.calendar-toolbar,
.calendar-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.calendar-toolbar {
  justify-content: space-between;
}
.calendar-controls h2 {
  font-size: 1.5rem;
  min-width: 12rem;
  text-align: center;
}
.calendar-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.calendar-filter select {
  background: var(--field);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.65rem;
}
.calendar-month {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}
.calendar-weekdays,
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.calendar-weekdays {
  background: var(--panel);
  text-align: center;
  padding-block: 0.8rem;
  font-weight: 600;
}
.calendar-day {
  min-height: 10rem;
  padding: 0.5rem;
  border-top: 1px solid var(--line);
  border-right: 1px solid var(--line);
}
.calendar-day:nth-child(7n) {
  border-right: 0;
}
.outside-month {
  background: var(--panel);
  color: var(--muted);
}
.calendar-date {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.4rem;
  border-radius: 50%;
  font-size: 0.9rem;
}
.calendar-date[aria-current] {
  background: var(--brand-primary);
  color: var(--on-primary);
}
.calendar-event {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  width: 100%;
  text-align: left;
  padding: 0.6rem;
  margin-bottom: 0.4rem;
  border: 1px solid var(--line);
  border-inline-start: 3px solid var(--brand-primary);
  border-radius: var(--radius);
  background: var(--panel);
  color: var(--ink);
  font-size: 0.8rem;
  cursor: pointer;
  overflow-wrap: anywhere;
}
.calendar-event:hover,
.calendar-agenda-item:hover {
  outline: 1px solid var(--ink);
}
.calendar-event-time {
  color: var(--muted);
}
.calendar-agenda {
  display: none;
}
.calendar-agenda-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
  padding: 1rem;
  background: var(--panel);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  cursor: pointer;
}
.event-details {
  display: grid;
  gap: 1rem;
}
.event-details dt {
  color: var(--muted);
  font-size: 0.85rem;
}
.event-details dd {
  margin: 0.25rem 0 0;
}
@media (max-width: 700px) {
  .calendar-month {
    display: none;
  }
  .calendar-agenda {
    display: flex;
  }
  .calendar-controls {
    gap: 0.4rem;
  }
  .calendar-controls h2 {
    min-width: 0;
    font-size: 1.2rem;
  }
}
</style>
