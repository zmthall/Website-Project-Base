import type { ImageMedia } from '../../shared/types/image';
import type { Action } from '../../shared/types/action';
export interface Feature {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image?: ImageMedia;
  action?: Action;
}
export interface ProcessStep extends Feature {
  number?: number;
}
export interface TrustItem {
  id: string;
  name: string;
  description?: string;
  image?: ImageMedia;
  icon?: string;
  action?: Action;
  issuer?: string;
  year?: string;
}
export interface Stat {
  id: string;
  value: string | number;
  label: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  accessibleLabel?: string;
  icon?: string;
}
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  previousPrice?: string;
  description?: string;
  features: string[];
  featured?: boolean;
  action?: Action;
}
export interface Resource extends Feature {
  fileType?: string;
  fileSize?: string;
}
