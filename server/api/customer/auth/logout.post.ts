import { logoutCustomer, requireCustomerCsrf } from '../../../utils/customer-auth';
export default defineEventHandler((event) => {
  requireCustomerCsrf(event);
  logoutCustomer(event);
  setResponseStatus(event, 204);
});
