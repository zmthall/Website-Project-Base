import { customerConfig, getCustomerEntry, refreshCustomer } from '../../../utils/customer-auth';
export default defineEventHandler((event) => {
  customerConfig(event);
  return refreshCustomer(getCustomerEntry(event, true)!);
});
