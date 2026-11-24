// TODO [AUTH-03]: Replace long-term environment preset passwords with managed provisioning/MFA and audited role changes; add password-change, deletion and recovery policies for registered accounts. See docs/integration-audit.md.
import {
  customerConfig,
  limitCustomerLogin,
  loginCustomer,
  readCustomerCredentials,
  refreshCustomer,
  requireCustomerCsrf,
} from '../../../utils/customer-auth';
import { customerDatabase } from '../../../utils/customer-database';
export default defineEventHandler(async (event) => {
  const config = customerConfig(event);
  requireCustomerCsrf(event);
  limitCustomerLogin(event);
  const { email, password } = await readCustomerCredentials(event, true);
  if (email === config.customerEmail.trim().toLowerCase())
    throw createError({
      statusCode: 409,
      statusMessage: 'Unable to create account. Try signing in.',
    });
  const database = customerDatabase(event);
  let account;
  try {
    account = await database.register(email, password);
  } catch (error) {
    if (error instanceof Error && 'errcode' in error && error.errcode === 2067)
      throw createError({
        statusCode: 409,
        statusMessage: 'Unable to create account. Try signing in.',
      });
    throw createError({ statusCode: 503, statusMessage: 'Customer registration is unavailable' });
  }
  return refreshCustomer(loginCustomer(event, account));
});
