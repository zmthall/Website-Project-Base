import { createFeatureApis } from '../../feature-layers/api';
export default defineNuxtPlugin({
  name: 'features',
  dependsOn: ['api'],
  setup(app) {
    const features = createFeatureApis(app.$api, useSiteConfig().features);
    return { provide: { features } };
  },
});
