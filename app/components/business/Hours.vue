<script setup lang="ts">
import type { BusinessHours } from '../../../shared/types/business';
defineProps<{ hours: BusinessHours; timezone?: string; currentDay?: string }>();
</script>
<template>
  <div class="stack">
    <dl>
      <div
        v-for="day in hours.regular"
        :key="day.day"
        style="display: flex; justify-content: space-between; gap: 1rem; padding: 0.4rem 0"
        :style="{ fontWeight: currentDay === day.day ? '700' : undefined }"
      >
        <dt style="text-transform: capitalize">{{ day.day }}</dt>
        <dd>
          {{
            day.periods.length
              ? day.periods.map((p) => `${p.opens}–${p.closes}`).join(', ')
              : 'Closed'
          }}
        </dd>
      </div>
    </dl>
    <p v-if="timezone" class="help">Times in {{ timezone }}</p>
    <div v-if="hours.special?.length">
      <h4>Special hours</h4>
      <p v-for="day in hours.special" :key="day.date">
        <time :datetime="day.date">{{ day.date }}</time>
        {{ day.label }}:
        {{
          day.periods.length
            ? day.periods.map((p) => `${p.opens}–${p.closes}`).join(', ')
            : 'Closed'
        }}
      </p>
    </div>
  </div>
</template>
