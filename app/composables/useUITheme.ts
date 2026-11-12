import { themeTokens } from '../theme/tokens';
export function useUITheme() {
  const config = useWebsiteUI();
  useUIFonts();
  const { mode } = useColorMode();
  useHead(() => ({
    htmlAttrs: {
      'data-color-mode': mode.value,
      'data-motion': String(config.value.motion),
      'data-theme': config.value.theme,
      'data-button-pack': config.value.packs.buttons.variant,
      'data-beveled': String(config.value.packs.buttons.beveled),
      style: themeTokens(config.value),
    },
  }));
}
