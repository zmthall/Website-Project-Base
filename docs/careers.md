# Careers and private applications

## Implemented locally

`/careers` is a configurable landing page with published job cards, department filtering when relevant, a job-details dialog, process information and application links. `/careers/apply` is a separate form page. No vacancies are automatically published as real openings.

## Publishing and application flow

1. An administrator creates an opening at `/admin/jobs`, including description, department/location, employment type, responsibilities, shifts, qualifications and benefits/compensation.
2. Only `open` records appear in `/api/content/jobs` and the public landing page. Draft/closed jobs stay out of public results.
3. Job links pass `position=<id>` to the application page. It reviews an application notice before showing the shared form controls. General applications are supported.
4. The form collects relevant contact details, work preferences, availability and experience, with an optional HTTPS résumé/portfolio link, accuracy attestation and storage consent.
5. `POST /api/careers/applications` validates fields and current opening availability, assigns the position title/status/consent time on the server, and saves a private SQLite application.
6. `/admin/applications` allows status and internal-note changes. Submitted details remain immutable in both UI and server updates. Deletion uses the existing version-protected administration flow.

An unavailable query selection produces an explanation and general-application fallback. A submitted stale/closed opening is rejected by the server. Public content APIs do not list applicant records.

## Configuration and boundaries

Use `site.features.careers`, `shared/data/careers.ts` and `NUXT_MANAGEMENT_DATABASE`. The reference application's company-specific driving/background checks and retention promises were not copied. No document bytes or application emails are handled by this flow.

The older `app/features/careers/api.ts` is an external-backend contract; its upload-ID application model is not the same as this local form. Reconcile the chosen contract under API-01 before connecting it to another backend.

## What remains

- CAREER-01: approved retention/deletion, audited reviewer roles and notifications; private résumé storage/scanning if needed.
- UPLOAD-01/NOTIFY-01: actual object storage and delivery workers.
- DB-02/ADMIN-01: migrations, restore verification and privileged access audit.
- PRIVACY-01: client-approved application/privacy disclosures reflecting actual collection and processors.

Acceptance criteria: [integration-audit.md](integration-audit.md).

## Verification

Domain tests cover open/closed job selection, validation, consent and persistence. Browser tests cover opening creation, job dialogs, notice gating, preselection, responsive submission, private review and immutable applicant fields. Real storage/delivery and retention jobs require their own integration tests.
