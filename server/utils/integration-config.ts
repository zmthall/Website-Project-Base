import type { H3Event } from 'h3';
import type { ServerIntegrations } from '../config/integrations';
/** Server-only access point. Do not serialize this value or its nested objects. */
export function serverIntegrations(event: H3Event): ServerIntegrations {
  return useRuntimeConfig(event).integrations;
}
// TODO [SECRETS-01]: Replace environment-backed retrieval with a scoped secret-manager resolver
// when deployments require rotation/auditing. Never return credential values to admin/client APIs.
// TODO [CONFIG-01]: Validate the selected adapter's required keys and supported environment before
// connecting; reject unsupported providers instead of silently falling back to the demo.
