import {
  adminConfig,
  limitAdminLogin,
  loginAdmin,
  refreshAdmin,
  requireCsrf,
} from '../../../utils/admin-auth';
import { equalSecret } from '../../../../../../server/utils/secrets';
export default defineEventHandler(async (event) => {
  const config = adminConfig(event);
  requireCsrf(event);
  limitAdminLogin(event);
  const body = await readBody(event);
  if (
    typeof body?.email !== 'string' ||
    typeof body?.password !== 'string' ||
    body.email.length > 254 ||
    body.password.length > 1024
  )
    throw createError({ statusCode: 400, statusMessage: 'Invalid login request' });
  const emailMatches = equalSecret(
    body.email.trim().toLowerCase(),
    config.adminEmail.toLowerCase(),
  );
  const passwordMatches = equalSecret(body.password, config.adminPassword);
  if (!emailMatches || !passwordMatches)
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' });
  return refreshAdmin(loginAdmin(event));
});
