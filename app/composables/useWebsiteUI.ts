// TODO [THEME-01]: Add validated authorized theme edits, versioning and SSR-safe persistence only if runtime editing is needed; keep provider secrets out of browser-visible theme/site config. See docs/integration-audit.md.
import type { WebsiteUIConfig } from '../theme/types';
export function useWebsiteUI() {
  // Request-local state. Showcase edits are preview-only and never alter the source file.
  const defaults = useAppConfig().websiteUI;
  return useState<WebsiteUIConfig>(
    'website-ui',
    () => JSON.parse(JSON.stringify(defaults)) as WebsiteUIConfig,
  );
}
