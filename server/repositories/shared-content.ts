import { createManagedContentRepository } from '../utils/management-store';

/** PostgreSQL repositories for site-wide content without a dedicated feature layer. */
export const businessRepository = createManagedContentRepository('business');
export const faqRepository = createManagedContentRepository('faqs');
export const mediaRepository = createManagedContentRepository('media');
export const ratingRepository = createManagedContentRepository('ratings');
