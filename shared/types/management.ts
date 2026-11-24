export type ResourceKind =
  | 'blog'
  | 'events'
  | 'messages'
  | 'newsletters'
  | 'reviews'
  | 'subscribers'
  | 'jobs'
  | 'applications'
  | 'business'
  | 'faqs'
  | 'media'
  | 'ratings';
export type ManagedValue = string | number | boolean;
export interface ManagedRecord {
  id: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  fields: Record<string, ManagedValue>;
}
export interface ManagedPage {
  items: ManagedRecord[];
  total: number;
  page: number;
  pageSize: number;
}
export interface EditorField {
  key: string;
  label: string;
  type?:
    | 'text'
    | 'textarea'
    | 'email'
    | 'url'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'checkbox'
    | 'select';
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}
export interface ResourceDefinition {
  title: string;
  singular: string;
  description: string;
  feature?: string;
  canCreate: boolean;
  fields: EditorField[];
  primaryFieldLabel?: string;
  manageLabel?: string;
  editableFields?: string[];
  immutableFields?: string[];
}
export interface RenderedMarkdown {
  source: string;
  html: string;
  toc: { id: string; text: string; depth: number }[];
  readingMinutes: number;
}
export interface BlogPost extends ManagedRecord, RenderedMarkdown {
  slug: string;
}
export interface LocalAuthPolicy {
  sessionDurationMinutes: number;
  idleTimeoutMinutes: number;
}
