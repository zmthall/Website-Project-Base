import type { CalendarEvent } from './types';

/** Relative sample dates keep the demo useful; replace this factory with API records later. */
export function createDemoEvents(today: string): CalendarEvent[] {
  const [year, month] = today.split('-').map(Number);
  return [-1, 0, 1].flatMap((offset) => {
    const date = new Date(Date.UTC(year!, month! - 1 + offset, 1));
    const prefix = date.toISOString().slice(0, 7);
    return [
      {
        day: '06',
        title: 'Community coffee morning',
        category: 'Community',
        location: 'Main studio',
        startTime: '09:00',
        endTime: '10:30',
      },
      {
        day: '12',
        title: 'Ideas into action',
        category: 'Workshop',
        location: 'Workshop room',
        startTime: '14:00',
        endTime: '16:00',
      },
      {
        day: '12',
        title: 'Meet the team',
        category: 'Community',
        location: 'Main studio',
        startTime: '17:00',
        endTime: '18:00',
      },
      {
        day: '21',
        title: 'A conversation about good work',
        category: 'Online',
        location: 'Online · joining details to follow',
        startTime: '12:00',
        endTime: '13:00',
      },
      {
        day: '27',
        title: 'Open studio afternoon',
        category: 'Community',
        location: 'Main studio',
        startTime: '13:00',
        endTime: '16:00',
      },
    ].map(({ day, ...item }) => ({
      ...item,
      id: `${prefix}-${day}-${item.startTime}`,
      date: `${prefix}-${day}`,
      timeZone: 'America/Denver',
      description:
        'An example gathering to share ideas, make connections, and discover something new. This is a sample event for the website template.',
    }));
  });
}
