// TODO [PAY-03]: Before real checkout ships, disable simulation routes and demo catalog in production and require a registered real provider; setting an env provider name is not sufficient. See docs/integration-audit.md.
// TODO [PAY-02]: Add raw-body signed webhook endpoints, event-ID deduplication and amount/currency/session reconciliation in durable transactions; never trust redirects as proof of payment. See docs/integration-audit.md.
// TODO [API-02]: Add shared runtime request schemas, route-specific size/rate limits and redacted provider error translation; TypeScript request casts are not runtime validation. See docs/integration-audit.md.
import { isFeatureEnabled } from '../../../shared/utils/features';
import { site } from '../../../shared/data/site';
import { workflows } from '../../../shared/data/workflows';
import type {
  AppointmentRequest,
  AvailabilityQuery,
  EstimateRequest,
  PaymentPurpose,
  PaymentStatus,
  QuoteInput,
} from '../../../shared/types/workflows';
import { requireCustomer, requireCustomerCsrf } from '../../utils/customer-auth';
import { requireAdmin, requireCsrf } from '../../utils/admin-auth';
import { boundedJson } from '../../utils/bounded-body';
import { workflowService as service } from '../../utils/workflow-service';
export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store');
  const [resource, id, action, ...rest] = (getRouterParam(event, 'path') || '').split('/');
  if (rest.length) throw createError({ statusCode: 404 });
  if (resource === 'capabilities' && event.method === 'GET')
    return {
      mode: workflows.mode,
      uploads: isFeatureEnabled(site.features, 'uploads') && service.uploadsConfigured,
      notifications: 'outbox-only',
      payments: isFeatureEnabled(site.features, 'payments') ? 'demo' : false,
    };
  if (
    !['appointments', 'estimates', 'payments'].includes(resource || '') ||
    site.features[resource as 'appointments' | 'estimates' | 'payments'] !== true
  )
    throw createError({ statusCode: 404 });
  if (resource === 'appointments' && id === 'availability' && !action && event.method === 'GET')
    return service.availability(getQuery(event) as unknown as AvailabilityQuery);
  const admin = resource === 'estimates' && id === 'admin';
  if (admin) {
    requireAdmin(event);
    if (event.method === 'GET' && !action) return service.listEstimates();
    if (event.method === 'PUT' && action) {
      requireCsrf(event);
      return service.quote(action, (await boundedJson(event)) as unknown as QuoteInput);
    }
    throw createError({ statusCode: 405 });
  }
  const owner = requireCustomer(event).session!.account.id;
  if (event.method === 'GET') {
    if (action) throw createError({ statusCode: 404 });
    if (resource === 'appointments') {
      const records = service.listAppointments(owner);
      if (!id) return records;
      const record = records.find((r) => r.id === id);
      if (record) return record;
      throw createError({ statusCode: 404 });
    }
    if (resource === 'estimates')
      return id ? service.getEstimate(owner, id) : service.listEstimates(owner);
    return id ? service.verifyPayment(owner, id) : service.listPayments(owner);
  }
  requireCustomerCsrf(event);
  if (event.method !== 'POST') throw createError({ statusCode: 405 });
  const body = await boundedJson(event, 50000);
  const key = getHeader(event, 'idempotency-key') || '';
  if (resource === 'appointments') {
    if (!id) return service.book(owner, body as unknown as AppointmentRequest, key);
    if (action === 'cancel')
      return service.changeAppointment(
        owner,
        id,
        { version: body.version as number, cancel: true },
        key,
      );
    if (action === 'reschedule')
      return service.changeAppointment(
        owner,
        id,
        { version: body.version as number, date: body.date as string, time: body.time as string },
        key,
      );
  }
  if (resource === 'estimates') {
    if (!id)
      return service.requestEstimate(
        owner,
        body as unknown as EstimateRequest,
        key,
        isFeatureEnabled(site.features, 'uploads'),
      );
    if (action === 'decision')
      return service.decide(
        owner,
        id,
        body.decision as 'accepted' | 'declined',
        body.version as number,
        key,
      );
  }
  if (resource === 'payments') {
    if (!id) return service.createPayment(owner, body as unknown as PaymentPurpose, key);
    if (action === 'simulate' && workflows.mode === 'demo')
      return service.simulatePayment(owner, id, body.outcome as PaymentStatus);
    if (action === 'verify') return service.verifyPayment(owner, id);
  }
  throw createError({ statusCode: 404 });
});
