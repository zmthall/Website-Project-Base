// TODO [API-01]: Reconcile external feature contracts with local routes, supply credentials only to trusted backends, and reject uninstalled operations instead of assuming every adapter endpoint exists. See docs/integration-audit.md.
import type { ApiClient } from '../api/types';
import type { SiteFeatures } from '../../shared/types/site';
import { createContactApi } from './contact/api';
import { createNewsletterApi } from './newsletter/api';
import { createReviewsApi } from './reviews/api';
import { createSearchApi } from './search/api';
import { createCareersApi } from './careers/api';
import { createAppointmentsApi, createEstimatesApi, createPaymentsApi } from './_shared/workflows';
import { createUploadsApi } from './uploads/api';
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
