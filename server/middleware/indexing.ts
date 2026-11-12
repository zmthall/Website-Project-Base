import { site } from '../../shared/data/site';
import { indexingAllowed } from '../../shared/utils/discovery';
export default defineEventHandler((event) => {
  if (!indexingAllowed(useRuntimeConfig(event).indexingEnabled, site.url))
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
});
