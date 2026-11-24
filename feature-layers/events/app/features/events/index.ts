// TODO [EVENT-01]: Only after explicit opt-in, add owner-checked registrations, transactional capacity/waitlists and cancellation/refund rules; do not infer registration from published calendar entries. See docs/integration-audit.md.
/** Published CMS events feed /events; sample records never generate structured data. */
export type { CalendarEvent } from './types';
// Registration is intentionally disabled; capacity requires an explicit later opt-in.
