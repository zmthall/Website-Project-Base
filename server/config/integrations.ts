// TODO [SECRETS-02]: If runtime-editable credentials are needed, use authenticated envelope encryption with nonce/tag/key ID, separate KMS-held keys, audited writes and rotation; never reversible password hashes. See docs/integration-audit.md.
/**
 * Private Nuxt runtime-config defaults. Values are overridden by matching NUXT_INTEGRATIONS_* env vars.
 * TODO [CONFIG-01]: Wire each real adapter to these settings with fail-closed readiness validation;
 * declaring credentials does not install a provider or replace the current memory/SQLite stores.
 * Never move this object into runtimeConfig.public, shared/data, an API response, or application logs.
 */
export const integrationDefaults = {
  database: { driver: 'memory', url: '', tls: 'verify-full', poolMax: 10 },
  sessions: { driver: 'memory', redisUrl: '', signingSecret: '' },
  payments: {
    provider: 'demo',
    environment: 'sandbox',
    square: {
      applicationId: '',
      locationId: '',
      accessToken: '',
      webhookSignatureKey: '',
      webhookNotificationUrl: '',
    },
    stripe: { publishableKey: '', secretKey: '', webhookSecret: '' },
  },
  email: {
    provider: 'none',
    from: '',
    replyTo: '',
    apiKey: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    webhookSecret: '',
  },
  newsletter: { provider: 'none', apiKey: '', listId: '', webhookSecret: '' },
  uploads: {
    provider: 'none',
    bucket: '',
    region: '',
    endpoint: '',
    accessKeyId: '',
    secretAccessKey: '',
  },
  identity: {
    firebaseProjectId: '',
    firebaseCredentialsFile: '',
    supabaseUrl: '',
    supabaseServiceKey: '',
  },
  search: { provider: 'local', endpoint: '', index: '', apiKey: '' },
  spam: { provider: 'none', siteKey: '', secretKey: '' },
  observability: { endpoint: '', authToken: '' },
  secrets: { provider: 'environment', encryptionKeyId: '', encryptionKey: '', kmsKeyId: '' },
};
export type ServerIntegrations = typeof integrationDefaults;
