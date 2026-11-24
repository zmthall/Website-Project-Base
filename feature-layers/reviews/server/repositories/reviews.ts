import { createManagedContentRepository } from '../../../../server/utils/management-store';

/** PostgreSQL-backed moderated reviews owned by the Reviews feature layer. */
export const reviewRepository = createManagedContentRepository('reviews');
