// TODO [NEWS-01]: Implement double-opt-in confirmation, signed expiring unsubscribe/preferences tokens, webhook signature checks, suppression/deduplication and provider synchronization. See docs/integration-audit.md.
import { boundedJson } from '../../../../../server/utils/bounded-body';
import {
  checkPublicSubmission,
  requireSubmissionConsent,
} from '../../../../../server/utils/public-submissions';
import { validateManagedFields } from '../../../../../server/utils/management-validation';
import { managementStore } from '../../../../../server/utils/management-store';
export default defineEventHandler(async (event) => {
  checkPublicSubmission(event, 'newsletter');
  const body = await boundedJson(event, 10000);
  requireSubmissionConsent(body);
  const fields = validateManagedFields('subscribers', {
    email: typeof body.email === 'string' ? body.email.toLowerCase() : '',
    listId: body.listId || 'general',
    consentAt: new Date().toISOString(),
    status: 'requested',
  });
  const store = managementStore();
  const existing = store
    .list('subscribers')
    .find(
      (record) => record.fields.email === fields.email && record.fields.listId === fields.listId,
    );
  if (existing) {
    if (existing.fields.status === 'unsubscribed')
      store.save('subscribers', fields, existing.id, existing.version);
  } else store.save('subscribers', fields);
  return {
    status: 'requested',
    message: 'Your subscription request was saved. Email delivery is not connected yet.',
  };
});
