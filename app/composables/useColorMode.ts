export function useColorMode() {
  const config = useWebsiteUI();
  const preference = useCookie<'light' | 'dark' | 'system'>('ui-color-mode', {
    default: () => 'system',
    sameSite: 'lax',
    maxAge: 31536000,
  });
  const mode = computed(() =>
    config.value.mode === 'user'
      ? ['light', 'dark'].includes(preference.value)
        ? preference.value
        : 'system'
      : config.value.mode,
  );
  return { mode, preference };
}
