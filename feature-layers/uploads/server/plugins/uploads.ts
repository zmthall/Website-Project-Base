import { workflowService } from '../../../../server/utils/workflow-service';
import { site } from '../../../../shared/data/site';
import { isFeatureEnabled } from '../../../../shared/utils/features';
import { uploadStore } from '../utils/upload-runtime';

export default defineNitroPlugin(() => {
  if (isFeatureEnabled(site.features, 'uploads')) workflowService.configureUploads(uploadStore());
});
