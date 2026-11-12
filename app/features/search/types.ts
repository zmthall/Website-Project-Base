import type { Page } from '../_shared/types';
export interface SearchDocument {
  id: string;
  title: string;
  description: string;
  path: string;
  type: string;
  category?: string;
  publishedAt?: string;
}
export interface SearchQuery {
  q: string;
  type?: string;
  category?: string;
  sort?: 'relevance' | 'newest';
  page?: number;
  pageSize?: number;
}
export type SearchResult = Page<SearchDocument>;
