import { adminConfig, getAdminEntry, refreshAdmin } from '../../../utils/admin-auth';
export default defineEventHandler((event) => {
  adminConfig(event);
  return refreshAdmin(getAdminEntry(event, true)!);
});
