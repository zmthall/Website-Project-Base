import { createManagedContentRepository } from '../../../../server/utils/management-store';

/** PostgreSQL-backed event records owned by the Events feature layer. */
export const eventRepository = createManagedContentRepository('events');
