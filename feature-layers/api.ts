// TODO [API-01]: Reconcile external feature contracts with local routes, supply credentials only to trusted backends, and reject uninstalled operations instead of assuming every adapter endpoint exists. See docs/integration-audit.md.
import type { ApiClient } from '../app/api/types';
import type { SiteFeatures } from '../shared/types/site';
import { createAppointmentsApi } from './appointments';
import { createCareersApi } from './careers';
import { createContactApi } from './contact';
import { createNewsletterApi } from './newsletter';
import { createReviewsApi } from './reviews';
import { createSearchApi } from './search';
import { createEstimatesApi } from './estimates';
import { createPaymentsApi } from './payments';
import { createUploadsApi } from './uploads';
/** Request-local factories. Flags block disabled requests; the backend still authorizes every operation. */
export function createFeatureApis(api: ApiClient, features: SiteFeatures = {}) {
  return {
    appointments: createAppointmentsApi(api, features.appointments === true),
    estimates: createEstimatesApi(api, features.estimates === true),
    payments: createPaymentsApi(api, features.payments === true),
    contact: createContactApi(api, features.contact === true),
    newsletter: createNewsletterApi(api, features.newsletter === true),
    reviews: createReviewsApi(api, features.reviews === true),
    search: createSearchApi(api, features.search === true),
    careers: createCareersApi(api, features.careers === true),
    uploads: createUploadsApi(api, features.uploads === true),
  };
}
