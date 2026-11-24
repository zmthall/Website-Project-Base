import {
  databaseReadiness,
  initializeDatabase,
  stopDatabase,
} from '../utils/integration-config';
import { initializeManagedContent } from '../database/legacy-content-import';

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('close', stopDatabase);
  const config = useRuntimeConfig();
  await initializeDatabase(config.integrations.database);
  if (databaseReadiness().status === 'ready') await initializeManagedContent();
});
