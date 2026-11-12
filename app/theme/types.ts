export type ColorMode = 'light' | 'dark' | 'user';
export type ButtonShape = 'square' | 'soft' | 'round';
export interface FontChoice {
  family: string;
  source?: string;
}
/** Serializable settings: the future admin editor can save this exact shape. */
export interface WebsiteUIConfig {
  theme: string;
  palette: { primary: string; secondary: string; contrast: string; complementary: string };
  mode: ColorMode;
  motion: boolean;
  fonts: { sans: FontChoice; serif: FontChoice; headings: 'sans' | 'serif' };
  packs: {
    buttons: { variant: 'solid' | 'outline' | 'minimal'; shape: ButtonShape; beveled: boolean };
    navigation: 'inline' | 'centered' | 'bordered';
    footer: 'columns' | 'minimal' | 'centered';
  };
  shell: { header: boolean; footer: boolean; cookieBanner: boolean; backToTop: boolean };
  sections: Record<string, { enabled: boolean; variant: string }>;
}
export interface ThemeDefinition {
  label: string;
  description: string;
  contentWidth: string;
  sectionSpace: string;
  radius: string;
  sectionOrder: string[];
  sectionVariants: Record<string, string>;
}
