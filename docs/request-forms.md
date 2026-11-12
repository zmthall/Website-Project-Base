# Appointment and contact forms

## Appointments: implemented locally

`/appointments` uses shared form components to choose service, meeting format, compatible location/provider, date and available time, followed by contact details, notes and simulation consent. Customer sign-in is required to create/manage a record.

Availability is calculated by the server from business timezone, working days/hours, closures, lead time, horizon, provider/location relationships and service duration. Public availability responses contain time slots, not other customers' contact information. The page handles loading, empty/unavailable results, retry, validation and confirmation.

A stable request key prevents duplicate booking after retries. Server overlap/version checks protect booking, rescheduling and cancellation. `/customer/workflows` presents owned records and replacement times. A failed reschedule preserves the old appointment. Confirmations/reminders are outbox jobs only; no provider booking or email occurs.

Options live in `shared/data/appointments.ts`; scheduling rules live in `shared/data/workflows.ts`. Workflow records reset on restart. Endpoint/contracts: [workflows.md](workflows.md).

## Contact: implemented locally

`/contact` uses the schema-driven form for topic, name/email/message and consent. `POST /api/contact` checks feature availability, bounded JSON, consent, honeypot and local abuse limits, validates fields and stores a private message with initial workflow status and notes. `/admin/messages` is the inbox. Saving is acknowledged as storage, not email delivery.

Contact messages persist in the management SQLite file. The administrator can update status/notes; original submitted details are preserved on updates. The public feature adapter has a wider external contract than the current local endpoint, so verify the mapping before swapping backends.

## Remaining work

| Area                        | TODO IDs              | Needed additions                                                                  |
| --------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| Booking durability/rules    | DB-01, BOOK-01        | Transactions across replicas, persistent idempotency, advanced schedules/capacity |
| Customer booking experience | BOOK-02               | Policy-aware cancellation confirmation, prefill and recovery                      |
| Contact processing          | CONTACT-01            | Delivery/routing, shared spam controls and retention                              |
| Runtime request safety      | API-02, FORMS-01      | Shared schemas, limits and validation parity                                      |
| Notifications/privacy       | NOTIFY-01, PRIVACY-01 | Delivery worker and accurate client-approved disclosures                          |

All acceptance criteria and source anchors are in [integration-audit.md](integration-audit.md). Feature flags gate routes/APIs; credentials and storage settings are covered in [configuration-and-secrets.md](configuration-and-secrets.md).

## Verification

Browser tests cover customer scheduling, private access, CSRF, rescheduling/cancellation and accessible responsive forms. Unit tests cover slot rules, overlap, stale versions and reminders. Public message tests cover storage and private inbox behavior. These tests do not prove real delivery or multi-instance durability.
