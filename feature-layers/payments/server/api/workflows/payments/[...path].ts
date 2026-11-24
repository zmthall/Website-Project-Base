// TODO [PAY-03]: Before real checkout ships, disable simulation routes and demo catalog in production and require a registered real provider; setting an env provider name is not sufficient. See docs/integration-audit.md.
// TODO [PAY-02]: Add raw-body signed webhook endpoints, event-ID deduplication and amount/currency/session reconciliation in durable transactions; never trust redirects as proof of payment. See docs/integration-audit.md.
// TODO [API-02]: Add shared runtime request schemas, route-specific size/rate limits and redacted provider error translation; TypeScript request casts are not runtime validation. See docs/integration-audit.md.
import { isFeatureEnabled } from '../../../../../../shared/utils/features';
import { site } from '../../../../../../shared/data/site';
import { workflows } from '../../../../../../shared/data/workflows';
import type { PaymentPurpose, PaymentStatus } from '../../../../../../shared/types/workflows';
import {
  requireCustomer,
  requireCustomerCsrf,
} from '../../../../../customer/server/utils/customer-auth';
import { boundedJson } from '../../../../../../server/utils/bounded-body';
import { workflowService as service } from '../../../../../../server/utils/workflow-service';

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store');
  if (!isFeatureEnabled(site.features, 'payments')) throw createError({ statusCode: 404 });
  const [id, action, ...rest] = (getRouterParam(event, 'path') || '').split('/').filter(Boolean);
  if (rest.length) throw createError({ statusCode: 404 });
  const owner = requireCustomer(event).session!.account.id;
  if (event.method === 'GET') {
    if (action) throw createError({ statusCode: 404 });
    return id ? service.verifyPayment(owner, id) : service.listPayments(owner);
  }
  requireCustomerCsrf(event);
  if (event.method !== 'POST') throw createError({ statusCode: 405 });
  const body = await boundedJson(event, 50000);
  const key = getHeader(event, 'idempotency-key') || '';
  if (!id) return service.createPayment(owner, body as unknown as PaymentPurpose, key);
  if (action === 'simulate' && workflows.mode === 'demo')
    return service.simulatePayment(owner, id, body.outcome as PaymentStatus);
  if (action === 'verify') return service.verifyPayment(owner, id);
  throw createError({ statusCode: 404 });
});
