import { logoutAdmin, requireCsrf } from '../../../utils/admin-auth';
export default defineEventHandler((event) => {
  requireCsrf(event);
  logoutAdmin(event);
  setResponseStatus(event, 204);
});
