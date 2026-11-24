// TODO [EST-01]: Add audited multi-line revisions/requote/withdrawal policies, tax/discount/currency rules and durable acceptance evidence; preserve accepted versions when quoting changes. See docs/integration-audit.md.
/** Process-local requests, quotes, expiry, customer decisions and deposit references. */
export type {
  Estimate,
  EstimateRequest,
  EstimateLineItem,
  EstimateStatus,
  QuoteInput,
} from '#shared/types/workflows';
export { createEstimatesApi } from './api';
