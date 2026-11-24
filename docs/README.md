# Project documentation

Start with the [repository README](../README.md) for installation, configuration and the feature-status overview. These guides describe the current implementation, not the earlier roadmap phases.

## How to read these guides

- **Implemented locally** means working code exists in this repository. Check whether its storage is PostgreSQL, scoped SQLite, or process memory.
- **Integration boundary** means contracts or placeholders exist but a provider/worker is not connected.
- **Production follow-up** refers to a stable `TODO [ID]` in the [integration audit](integration-audit.md). Use that index for priority, acceptance criteria and code anchors.

Entering a credential or enabling a feature does not install a provider. No real payment, booking-provider operation or email/SMS delivery is configured. Workflow records reset on restart; public/editorial CMS records persist in PostgreSQL, while registered customer and private local records use scoped SQLite stores.

## Guides

| Guide                                                     | Use it for                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Architecture and API](application-api.md)                | Runtime layers, local versus external transports, authorization and errors   |
| [Features](features.md)                                   | Module status, routes, data flow and adapter boundaries                      |
| [Feature layers](feature-layers.md)                       | Modular feature manifests, layer packaging and migration conventions         |
| [Core composables](core-composables.md)                   | Shared configuration, UI state, auth, SEO and workflow helpers               |
| [UI system](ui-system.md)                                 | Themes, section variants, shared controls and extension conventions          |
| [Authentication](authentication.md)                       | Admin/customer accounts, guards, sessions and recovery limitations           |
| [Blog and content](blog.md)                               | PostgreSQL Markdown, publishing, live editor and custom prose                |
| [Careers](careers.md)                                     | Job publishing and private applications                                      |
| [Appointment/contact forms](request-forms.md)             | Scheduling and private inquiries                                             |
| [Estimates](estimates.md)                                 | Requests, admin quotes, expiry and customer decisions                        |
| [Private uploads](uploads.md)                             | Local storage lifecycle, ownership, inspection, quotas and production limits |
| [Workflows](workflows.md)                                 | Detailed appointment/estimate/payment APIs and repository/provider contracts |
| [Events](events.md)                                       | Calendar records, SEO and deferred registration                              |
| [Newsletter](newsletter.md)                               | Published issues, subscriber requests and delivery boundaries                |
| [Reviews](reviews.md)                                     | Public reviews, moderation and sample fallback                               |
| [Configuration and secrets](configuration-and-secrets.md) | Environment placeholders, private runtime config and secret storage          |
| [Integration audit](integration-audit.md)                 | Canonical source-anchored TODO register                                      |
| [Remaining work](remaining-work.md)                       | Integration sequence and production readiness overview                       |
| [Dependency decisions](package-todo.md)                   | Tooling choices and historical advisory findings                             |
| [GGM blog reference](blog-module-review.md)               | Historical source-review notes, not current template setup instructions      |

## Documentation maintenance

Update a feature guide when changing its routes, ownership, persistence, configuration or provider behavior. Complete the linked audit item and source TODO together only after its acceptance tests exist. Keep sample/simulated behavior explicit. Report dated test/advisory results as historical evidence rather than permanent guarantees.
