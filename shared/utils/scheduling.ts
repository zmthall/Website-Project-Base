/** Resolve a wall-clock value in an IANA zone, rejecting nonexistent DST times. */
export function zonedInstant(date: string, time: string, timeZone: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return;
  const target = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(target) || new Date(target).toISOString().slice(0, 10) !== date) return;
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  let candidate = target;
  for (let i = 0; i < 4; i++) {
    const parts = Object.fromEntries(
      format.formatToParts(new Date(candidate)).map((p) => [p.type, p.value]),
    );
    const wall = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`;
    const difference = target - Date.parse(wall);
    if (!difference) return new Date(candidate).toISOString();
    candidate += difference;
  }
}
export function zonedDate(now: number, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(now));
}
