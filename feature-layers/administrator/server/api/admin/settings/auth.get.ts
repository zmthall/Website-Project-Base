// TODO [SECRETS-01]: Add scoped secret-manager retrieval, credential-owner/rotation records, cache expiry and redacted diagnostics; never expose raw values to admin APIs. See docs/integration-audit.md.
import { site } from '../../../../../../shared/data/site';
import { localAuthPolicy } from '../../../../../../server/utils/auth-settings';
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  return {
    provider: 'local',
    ...localAuthPolicy('admin'),
    requireVerifiedEmail: false,
    firebase: { projectId: '', apiKey: '', authDomain: '', credentialsConfigured: false },
    supabase: { url: '', publishableKey: '', credentialsConfigured: false },
    customer: {
      provider: site.features.customer,
      ...localAuthPolicy('customer'),
      registrationEnabled: site.features.customer === 'local',
      presetConfigured: Boolean(config.customerEmail && config.customerPassword),
    },
    admin: {
      email: config.adminEmail,
      name: config.adminName,
      presetConfigured: Boolean(config.adminEmail && config.adminPassword),
    },
  };
});
