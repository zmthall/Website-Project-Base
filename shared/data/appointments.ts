import { workflows } from './workflows';
/** Display choices for the process-local scheduling simulation. */
export const appointments = {
  timeZone: workflows.appointments.timeZone,
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
