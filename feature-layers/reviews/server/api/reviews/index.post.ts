// TODO [REV-01]: Add audited moderation, abuse/duplicate handling and verified external-provider import; expose only public fields and consistent aggregates. See docs/integration-audit.md.
import { boundedJson } from '../../../../../server/utils/bounded-body';
import { checkPublicSubmission } from '../../../../../server/utils/public-submissions';
import { validateManagedFields } from '../../../../../server/utils/management-validation';
import { reviewRepository } from '../../repositories/reviews';
export default defineEventHandler(async (event) => {
  checkPublicSubmission(event, 'reviews');
  const body = await boundedJson(event, 15000);
  const fields = validateManagedFields('reviews', { ...body, status: 'pending', notes: '' });
  const record = await reviewRepository.save(fields);
  return { id: record.id, status: 'pending-moderation' };
});
