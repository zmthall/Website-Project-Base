import { equalSecret } from '../../../../../../server/utils/secrets';
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
  const { email, password } = await readCustomerCredentials(event);
  let account = null;
  if (config.customerEmail && email === config.customerEmail.trim().toLowerCase()) {
    if (config.customerPassword && equalSecret(password, config.customerPassword))
      account = {
        id: 'env-customer',
        email,
        displayName: config.customerName,
        emailVerified: false,
        roles: ['customer'],
      };
  } else account = await customerDatabase(event).login(email, password);
  if (!account) throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' });
  return refreshCustomer(loginCustomer(event, account));
});
