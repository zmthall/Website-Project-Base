import type { ThemeDefinition } from './types';
/** Add named themes here. Components inherit semantic tokens, not theme-specific code. */
export const themes: Record<string, ThemeDefinition> = {
  foundation: {
    label: 'Foundation',
    description: 'A quiet, minimal business foundation.',
    contentWidth: '76rem',
    sectionSpace: '5rem',
    radius: '0.5rem',
    sectionOrder: [
      'hero',
      'trust',
      'services',
      'about',
      'process',
      'testimonials',
      'faq',
      'contact',
    ],
    sectionVariants: {
      hero: 'split',
      trust: 'bar',
      services: 'cards',
      about: 'split',
      process: 'steps',
      testimonials: 'featured',
      faq: 'accordion',
      contact: 'split',
    },
  },
};
export const buttonPacks = ['solid', 'outline', 'minimal'] as const;
export const navigationPacks = ['inline', 'centered', 'bordered'] as const;
export const footerPacks = ['columns', 'minimal', 'centered'] as const;
