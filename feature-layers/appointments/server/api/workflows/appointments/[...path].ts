// TODO [API-02]: Add shared runtime request schemas, route-specific size/rate limits and redacted provider error translation; TypeScript request casts are not runtime validation. See docs/integration-audit.md.
import { site } from '../../../../../../shared/data/site';
import type {
  AppointmentRequest,
  AvailabilityQuery,
} from '../../../../app/features/appointments/types';
import {
  requireCustomer,
  requireCustomerCsrf,
} from '../../../../../customer/server/utils/customer-auth';
import { boundedJson } from '../../../../../../server/utils/bounded-body';
import { appointmentService } from '../../../utils/appointment-service';

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store');
  if (site.features.appointments !== true) throw createError({ statusCode: 404 });
  const [id, action, ...rest] = (getRouterParam(event, 'path') || '').split('/');
  if (rest.length) throw createError({ statusCode: 404 });
  if (id === 'availability' && !action && event.method === 'GET')
    return appointmentService.availability(getQuery(event) as unknown as AvailabilityQuery);

  const ownerId = requireCustomer(event).session!.account.id;
  if (event.method === 'GET') {
    if (action) throw createError({ statusCode: 404 });
    const records = appointmentService.list(ownerId);
    if (!id) return records;
    const record = records.find((appointment) => appointment.id === id);
    if (record) return record;
    throw createError({ statusCode: 404 });
  }

  requireCustomerCsrf(event);
  if (event.method !== 'POST') throw createError({ statusCode: 405 });
  const body = await boundedJson(event, 50000);
  const key = getHeader(event, 'idempotency-key') || '';
  if (!id) return appointmentService.book(ownerId, body as unknown as AppointmentRequest, key);
  if (action === 'cancel')
    return appointmentService.change(
      ownerId,
      id,
      { version: body.version as number, cancel: true },
      key,
    );
  if (action === 'reschedule')
    return appointmentService.change(
      ownerId,
      id,
      { version: body.version as number, date: body.date as string, time: body.time as string },
      key,
    );
  throw createError({ statusCode: 404 });
});
