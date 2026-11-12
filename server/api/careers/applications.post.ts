// TODO [CAREER-01]: Define applicant retention/deletion, audited reviewer permissions and notifications; add private resume storage/scanning only when the upload adapter is ready. See docs/integration-audit.md.
import { boundedJson } from '../../utils/bounded-body';
import { checkPublicSubmission } from '../../utils/public-submissions';
import { managementStore } from '../../utils/management-store';
import { applicationFields } from '../../utils/career-applications';
export default defineEventHandler(async (event) => {
  checkPublicSubmission(event, 'careers');
  const body = await boundedJson(event, 50000);
  const store = managementStore();
  const fields = applicationFields(body, store.list('jobs'));
  const record = store.save('applications', fields);
  setResponseStatus(event, 201);
  return { id: record.id, status: 'received' };
});
