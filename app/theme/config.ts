// TODO [THEME-01]: Add validated authorized theme edits, versioning and SSR-safe persistence only if runtime editing is needed; keep provider secrets out of browser-visible theme/site config. See docs/integration-audit.md.
import type { WebsiteUIConfig } from './types';
/** Client customization entry. No functions/components so it can be edited by an admin later. */
export const websiteUI: WebsiteUIConfig = {
  theme: 'foundation',
  palette: {
    primary: '#284F46',
    secondary: '#DDE5DD',
    contrast: '#202923',
    complementary: '#D9C8AC',
  },
  mode: 'user',
  motion: false,
  fonts: {
    sans: { family: 'Arial, Helvetica, sans-serif' },
    serif: { family: 'Georgia, Times New Roman, serif' },
    headings: 'sans',
  },
  packs: {
    buttons: { variant: 'solid', shape: 'soft', beveled: false },
    navigation: 'inline',
    footer: 'columns',
  },
  shell: { header: true, footer: true, cookieBanner: true, backToTop: true },
  sections: {
    hero: { enabled: true, variant: 'theme' },
    trust: { enabled: true, variant: 'theme' },
    services: { enabled: true, variant: 'theme' },
    about: { enabled: true, variant: 'theme' },
    process: { enabled: true, variant: 'theme' },
    testimonials: { enabled: true, variant: 'theme' },
    faq: { enabled: true, variant: 'theme' },
    contact: { enabled: true, variant: 'theme' },
  },
};
