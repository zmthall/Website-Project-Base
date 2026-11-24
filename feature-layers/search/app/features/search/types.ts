import type { Page } from '../../../../_shared/types';
export type SearchScope = 'all' | 'page' | 'content' | 'event';
export interface SearchDocument {
  id: string;
  title: string;
  description: string;
  path: string;
  type: string;
  scope?: Exclude<SearchScope, 'all'>;
  category?: string;
  publishedAt?: string;
}
export interface SearchQuery {
  q: string;
  scope?: SearchScope;
  type?: string;
  category?: string;
  sort?: 'relevance' | 'newest';
  page?: number;
  pageSize?: number;
}
export type SearchResult = Page<SearchDocument>;
