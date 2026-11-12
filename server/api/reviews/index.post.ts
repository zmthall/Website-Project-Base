// TODO [REV-01]: Add audited moderation, abuse/duplicate handling and verified external-provider import; expose only public fields and consistent aggregates. See docs/integration-audit.md.
import { boundedJson } from '../../utils/bounded-body';
import { checkPublicSubmission } from '../../utils/public-submissions';
import { validateManagedFields } from '../../utils/management-validation';
import { managementStore } from '../../utils/management-store';
export default defineEventHandler(async (event) => {
  checkPublicSubmission(event, 'reviews');
  const body = await boundedJson(event, 15000);
  const fields = validateManagedFields('reviews', { ...body, status: 'pending', notes: '' });
  const record = managementStore().save('reviews', fields);
  return { id: record.id, status: 'pending-moderation' };
});
