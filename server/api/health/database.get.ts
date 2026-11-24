import { databaseReadiness } from '../../utils/integration-config';

export default defineEventHandler((event) => {
  const database = databaseReadiness();
  if (database.status !== 'ready' && database.status !== 'disabled') setResponseStatus(event, 503);
  return { database };
});
