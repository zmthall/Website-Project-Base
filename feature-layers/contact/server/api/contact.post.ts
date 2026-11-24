// TODO [CONTACT-01]: Connect configured notification routing and acknowledgments, shared abuse controls and retention/deletion; a stored message is not a delivered email. See docs/integration-audit.md.
import { boundedJson } from '../../../../server/utils/bounded-body';
import {
  checkPublicSubmission,
  requireSubmissionConsent,
} from '../../../../server/utils/public-submissions';
import { validateManagedFields } from '../../../../server/utils/management-validation';
import { managementStore } from '../../../../server/utils/management-store';

export default defineEventHandler(async (event) => {
  checkPublicSubmission(event, 'contact');
  const body = await boundedJson(event, 20000);
  requireSubmissionConsent(body);
  if (body.website) throw createError({ statusCode: 400, statusMessage: 'Invalid submission' });
  const fields = validateManagedFields('messages', { ...body, status: 'new', notes: '' });
  const record = managementStore().save('messages', fields);
  return { id: record.id, status: 'received', message: 'Your message was saved for the team.' };
});
