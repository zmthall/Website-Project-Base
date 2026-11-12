import type { BusinessHours, DayOfWeek } from '../../shared/types/business';
const days: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];
const minute = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
/** Local wall-clock schedule; special dates replace weekly periods, including closures. */
export function businessHoursStatus(hours: BusinessHours, timezone: string, now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const current = Number(parts.hour) * 60 + Number(parts.minute);
  const base = new Date(`${today}T12:00:00Z`);
  const intervals: { start: number; end: number }[] = [];
  for (let offset = -1; offset < 8; offset++) {
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + offset);
    const key = date.toISOString().slice(0, 10);
    const special = hours.special?.find((h) => h.date === key);
    const periods =
      special?.periods ??
      hours.regular.find((h) => h.day === days[date.getUTCDay()])?.periods ??
      [];
    for (const period of periods) {
      const start = offset * 1440 + minute(period.opens);
      let end = offset * 1440 + minute(period.closes);
      if (end <= start) end += 1440;
      // A special full-day closure overrides an overnight spill from yesterday.
      if (offset === -1 && hours.special?.some((h) => h.date === today && h.periods.length === 0))
        continue;
      intervals.push({ start, end });
    }
  }
  intervals.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const interval of intervals) {
    const last = merged.at(-1);
    if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end);
    else merged.push({ ...interval });
  }
  const active = merged.find((i) => i.start <= current && i.end > current);
  const next = active?.end ?? merged.find((i) => i.start > current)?.start;
  let change: string | undefined;
  if (next !== undefined) {
    const dayOffset = Math.floor(next / 1440);
    const time = next % 1440;
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    change = `${dayOffset === 0 ? 'today' : days[date.getUTCDay()]} at ${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
  }
  return { open: !!active, nextChange: change, day: days[base.getUTCDay()]!, date: today };
}
