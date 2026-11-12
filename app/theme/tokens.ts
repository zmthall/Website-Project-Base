import type { WebsiteUIConfig } from './types';
import { themes } from './registry';
export function validColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}
export function luminance(hex: string): number {
  const values = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return values[0]! * 0.2126 + values[1]! * 0.7152 + values[2]! * 0.0722;
}
export function contrastRatio(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}
export function onColor(color: string): string {
  return contrastRatio(color, '#ffffff') > contrastRatio(color, '#000000') ? '#ffffff' : '#000000';
}
export function themeTokens(config: WebsiteUIConfig): Record<string, string> {
  const theme = themes[config.theme] ?? themes.foundation!;
  const palette = config.palette;
  for (const value of Object.values(palette))
    if (!validColor(value)) throw new Error('Palette colors must be six-digit hex values.');
  return {
    '--brand-primary': palette.primary,
    '--on-primary': onColor(palette.primary),
    '--brand-secondary': palette.secondary,
    '--on-secondary': onColor(palette.secondary),
    '--brand-contrast': palette.contrast,
    '--on-contrast': onColor(palette.contrast),
    '--brand-complementary': palette.complementary,
    '--on-complementary': onColor(palette.complementary),
    '--font-body': config.fonts.sans.family,
    '--font-editorial': config.fonts.serif.family,
    '--font-heading': config.fonts[config.fonts.headings].family,
    '--content-width': theme.contentWidth,
    '--section-space': theme.sectionSpace,
    '--radius': theme.radius,
    '--button-radius': { square: '0', soft: '.45rem', round: '999px' }[config.packs.buttons.shape],
  };
}
