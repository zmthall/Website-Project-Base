// TODO [ADMIN-01]: Add durable audit events and least-privilege roles for content edits/deletes, applicant/message access and auth policy changes; add retention/export actions where appropriate. See docs/integration-audit.md.
import { boundedJson } from '../../../utils/bounded-body';
import { managementStore } from '../../../utils/management-store';
import { validateAuthPolicy } from '../../../utils/auth-settings';
export default defineEventHandler(async (event) => {
  const body = await boundedJson(event, 10000);
  const settings = body.settings as Record<string, unknown>;
  if (
    !settings ||
    settings.provider !== 'local' ||
    settings.requireVerifiedEmail === true ||
    body.firebaseServiceAccount ||
    body.supabaseSecretKey
  )
    throw createError({
      statusCode: 400,
      statusMessage:
        'Only local authentication is implemented. Email verification and external providers are not configured.',
    });
  const admin = validateAuthPolicy(settings);
  const customer = body.customer ? validateAuthPolicy(body.customer) : undefined;
  managementStore().savePolicy('admin', admin);
  if (customer) managementStore().savePolicy('customer', customer);
  setResponseStatus(event, 204);
});
