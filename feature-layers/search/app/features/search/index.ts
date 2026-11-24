// TODO [SEARCH-01]: Create a public-only publication-aware index and invalidate it on edits/deletions; scope remote credentials and rate-limit queries without indexing account/admin/applicant records. See docs/integration-audit.md.
export type * from './types';
export { createSearchApi } from './api';
export { searchDocuments, normalizeQuery, parseSearchInput } from './utils';
export { useSearch } from './useSearch';
