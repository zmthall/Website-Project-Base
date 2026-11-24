// TODO [API-02]: Add shared runtime request schemas, route-specific size/rate limits and redacted provider error translation; TypeScript request casts are not runtime validation. See docs/integration-audit.md.
import { isFeatureEnabled } from '../../../../../../shared/utils/features';
import { site } from '../../../../../../shared/data/site';
import type { EstimateRequest, QuoteInput } from '../../../../../../shared/types/workflows';
import {
  requireCustomer,
  requireCustomerCsrf,
} from '../../../../../customer/server/utils/customer-auth';
import { requireAdmin, requireCsrf } from '../../../../../administrator/server/utils/admin-auth';
import { boundedJson } from '../../../../../../server/utils/bounded-body';
import { workflowService as service } from '../../../../../../server/utils/workflow-service';

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store');
  if (!isFeatureEnabled(site.features, 'estimates')) throw createError({ statusCode: 404 });
  const [id, action, ...rest] = (getRouterParam(event, 'path') || '').split('/').filter(Boolean);
  if (rest.length) throw createError({ statusCode: 404 });
  if (id === 'admin') {
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
    return id ? service.getEstimate(owner, id) : service.listEstimates(owner);
  }
  requireCustomerCsrf(event);
  if (event.method !== 'POST') throw createError({ statusCode: 405 });
  const body = await boundedJson(event, 50000);
  const key = getHeader(event, 'idempotency-key') || '';
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
  throw createError({ statusCode: 404 });
});
