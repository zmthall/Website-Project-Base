import { createManagedContentRepository } from '../../../../server/utils/management-store';

/** PostgreSQL-backed editorial records owned by the Blog feature layer. */
export const blogRepository = createManagedContentRepository('blog');
