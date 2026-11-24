import type { ContactDetails } from '../../../../../shared/types/workflows';

export interface TimeSlot {
  id: string;
  startsAt: string;
  endsAt: string;
  service: string;
  location: string;
  provider: string;
  timeZone: string;
}

export interface AvailabilityQuery {
  date: string;
  service: string;
  location: string;
  provider: string;
}

export interface Appointment extends TimeSlot {
  ownerId: string;
  contact: ContactDetails;
  meeting: string;
  notes: string;
  status: 'confirmed' | 'canceled';
  version: number;
}

export interface AppointmentRequest extends AvailabilityQuery {
  time: string;
  meeting: string;
  contact: ContactDetails;
  notes?: string;
  consent: true;
}
