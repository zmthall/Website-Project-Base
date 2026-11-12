import { featureClient } from './transport';
import type { ApiClient } from '../../api/types';
import type {
  Appointment,
  AppointmentRequest,
  AvailabilityQuery,
  TimeSlot,
  Estimate,
  EstimateRequest,
  PaymentPurpose,
  PaymentSession,
} from '#shared/types/workflows';
/** Cookie/CSRF handling is supplied by the local Nuxt transport, not by these contracts. */
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
export function createEstimatesApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    list: () => api<Estimate[]>('/workflows/estimates'),
    get: (id: string) => api<Estimate>(`/workflows/estimates/${encodeURIComponent(id)}`),
    request: (body: EstimateRequest, key: string) =>
      api<Estimate>('/workflows/estimates', {
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
    decide: (id: string, decision: 'accepted' | 'declined', version: number, key: string) =>
      api<Estimate>(`/workflows/estimates/${encodeURIComponent(id)}/decision`, {
        method: 'POST',
        body: { decision, version },
        headers: { 'Idempotency-Key': key },
      }),
  };
}
export function createPaymentsApi(client: ApiClient, enabled = true) {
  const api = featureClient(client, enabled);
  return {
    list: () => api<PaymentSession[]>('/workflows/payments'),
    create: (body: PaymentPurpose, key: string) =>
      api<PaymentSession>('/workflows/payments', {
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
    verify: (id: string) => api<PaymentSession>(`/workflows/payments/${encodeURIComponent(id)}`),
  };
}
