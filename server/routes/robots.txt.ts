import { site } from '../../shared/data/site';
import { indexingAllowed, robotsText } from '../../shared/utils/discovery';
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return robotsText(site.url, indexingAllowed(useRuntimeConfig(event).indexingEnabled, site.url));
});
