import { safeMediaURL } from '../utils/media';
/** Sources are font files (for example /fonts/brand.woff2), not remote stylesheet URLs. */
export function useUIFonts() {
  const config = useWebsiteUI();
  useHead(() => ({
    style: Object.entries(config.value.fonts).flatMap(([role, font]) => {
      if (
        typeof font === 'string' ||
        !font.source ||
        !safeMediaURL(font.source) ||
        /["'<>;{}\\]/.test(font.source) ||
        /["'<>;{}\\]/.test(font.family)
      )
        return [];
      return [
        {
          key: `font-${role}`,
          textContent: `@font-face{font-family:"${font.family}";src:url("${font.source}");font-display:swap;}`,
        },
      ];
    }),
  }));
}
