import { isFeatureEnabled } from '../../../shared/utils/features';
import { site } from '../../../shared/data/site';
import { workflows } from '../../../shared/data/workflows';
import { workflowService as service } from '../../utils/workflow-service';

export default defineEventHandler(() => ({
  mode: workflows.mode,
  uploads: isFeatureEnabled(site.features, 'uploads') && service.uploadsConfigured,
  notifications: 'outbox-only',
  payments: isFeatureEnabled(site.features, 'payments') ? 'demo' : false,
}));
