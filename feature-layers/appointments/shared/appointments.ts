// TODO [BOOK-01]: Add provider-specific schedules, holidays, duration/buffer and location capacity rules with transactional overlap constraints, timezone/DST tests and authoritative clock handling. See docs/integration-audit.md.
export const appointmentWorkflow = {
  timeZone: 'America/Denver',
  leadMinutes: 60,
  horizonDays: 90,
  weekdays: [1, 2, 3, 4, 5],
  closedDates: [] as string[],
  serviceMinutes: { introduction: 30, consultation: 60, 'follow-up': 30 } as Record<
    string,
    number
  >,
  locations: [
    { value: 'office', label: 'Main office' },
    { value: 'remote', label: 'Remote meeting' },
  ],
  providers: [{ value: 'team', label: 'Consultation team', locations: ['office', 'remote'] }],
  opens: '09:00',
  closes: '17:00',
  intervalMinutes: 30,
};

/** Display choices for the process-local scheduling simulation. */
export const appointments = {
  timeZone: appointmentWorkflow.timeZone,
  services: [
    { label: 'Introductory conversation · 30 minutes', value: 'introduction' },
    { label: 'Project consultation · 60 minutes', value: 'consultation' },
    { label: 'Follow-up conversation · 30 minutes', value: 'follow-up' },
  ],
  meetingTypes: [
    { label: 'Phone call', value: 'phone' },
    { label: 'Video call', value: 'video' },
    { label: 'In person', value: 'in-person' },
  ],
  times: [
    { label: '9:00 AM', value: '09:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '4:00 PM', value: '16:00' },
  ],
};
