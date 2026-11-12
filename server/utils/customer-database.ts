// TODO [DB-02]: Add schema migrations, private-path validation for every store, consistent connection lifecycle, backups/restore tests and a documented multi-instance deployment strategy. See docs/integration-audit.md.
import type { H3Event } from 'h3';
import { CustomerAccounts } from './customer-accounts';
let database: CustomerAccounts | undefined;
export function customerDatabase(event: H3Event) {
  database ??= new CustomerAccounts(useRuntimeConfig(event).customerDatabase);
  return database;
}
