import { createCustomerAuthAdapter, createCustomerAuthStore } from '../features/customer';
export default defineNuxtPlugin({
  name: 'customer-auth',
  setup: () => ({
    provide: { customerAuth: createCustomerAuthStore(createCustomerAuthAdapter()) },
  }),
});
