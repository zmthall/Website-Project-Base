import { featureClient } from '../../../../_shared/transport';
import type { ApiClient } from '../../../../../app/api/types';
import type { Appointment, AppointmentRequest, AvailabilityQuery, TimeSlot } from './types';

/** Cookie/CSRF handling is supplied by the local Nuxt transport, not by this contract. */
export function createAppointmentsApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    availability: (query: AvailabilityQuery, signal?: AbortSignal) =>
      api<TimeSlot[]>('/workflows/appointments/availability', { query: { ...query }, signal }),
    list: () => api<Appointment[]>('/workflows/appointments'),
    book: (body: AppointmentRequest, key: string) =>
      api<Appointment>('/workflows/appointments', {
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
    change: (
      id: string,
      action: 'cancel' | 'reschedule',
      body: { version: number; date?: string; time?: string },
      key: string,
    ) =>
      api<Appointment>(`/workflows/appointments/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
  };
}
