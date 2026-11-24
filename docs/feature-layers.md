# Feature layers

Feature layers provide an additive migration path from the current working application to self-contained Nuxt feature packages. A manifest points to existing implementation locations until that feature is migrated and verified; migrated features keep their owned application and server files inside the layer without duplicating them.

## Current structure

Each directory under `feature-layers/` is a valid local Nuxt layer:

```text
feature-layers/contact/
├── index.ts
├── management.ts
├── theme.ts
├── app/
│   ├── components/
│   │   ├── admin/ContactMessages.vue
│   │   ├── contact/Section.vue
│   │   └── sections/contact/
│   ├── features/contact/
│   │   ├── api.ts
│   │   ├── form.ts
│   │   └── types.ts
│   └── pages/
├── server/api/contact.post.ts
├── tests/
│   ├── browser/contact.spec.ts
│   └── contact.test.ts
├── feature.ts
└── nuxt.config.ts
```

`feature.ts` declares the stable feature key, configuration kind, maturity, dependencies, guarded public routes, owned implementation paths and shared dependencies. `nuxt.config.ts` makes the directory a Nuxt layer and owns feature-specific Nuxt configuration.

The central `feature-layers/registry.ts` is the installation list. `nuxt.config.ts` extends the registered layer paths, and `shared/utils/features.ts` derives its route guards from the same manifests. Existing `site.features`, `useFeature`, middleware and API factories continue to control runtime availability.

## Adding a feature

1. Add the feature key and configuration value to `SiteFeatures`.
2. Create `feature-layers/<key>/nuxt.config.ts`.
3. Create a manifest with `defineFeature` in `feature-layers/<key>/feature.ts`.
4. Add the manifest to `featureDefinitions` in `feature-layers/registry.ts`.
5. Add a disabled-by-default value to the client site configuration.
6. Add route-guard, registry and feature behavior tests.

The registry validates duplicate keys, duplicate route prefixes and missing dependencies when Nuxt loads its configuration.

## Target feature package

Move code only after a layer shell is registered and the existing behavior is covered by tests:

```text
feature-layers/contact/
├── nuxt.config.ts
├── feature.ts
├── app/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── pages/
│   └── plugins/
├── server/
│   ├── api/
│   ├── repositories/
│   ├── services/
│   └── utils/
├── shared/
│   ├── data/
│   ├── types/
│   └── utils/
└── tests/
```

Nuxt merges a layer's application, server and shared directories into the consuming application. Use feature-prefixed component names to avoid auto-import collisions.

## Migration status

All registered features now have layer-owned implementations. Contact's form schema, public page, reusable section variants/rendering, theme registrations, administrator page/component, inbox resource metadata, client API contract, server endpoint and dedicated tests live under `feature-layers/contact/`. The layer-level `index.ts` is its universal programmatic entry point; app-only theme registrations use the `theme.ts` subpath so Vue component loaders never enter server-only consumers.

The Appointments layer owns its booking page, customer management component, choices and scheduling rules, client API/types, server endpoint/domain service, sitemap route and tests. It reuses shared customer authentication, request limits, workflow persistence, scheduling utilities, idempotency and outbox support; those integration seams are listed under `implementation.shared`.

The Administrator layer owns the admin authentication contract/store, plugins, composable, route guard, protected layout, login/dashboard/settings UI, server middleware, session service, endpoints and tests. The feature key is `administrator`; `auth` remains terminology only for authentication operations such as `/api/admin/auth/*` and `useAdminAuth`.

Customer owns account registration, sessions, persistence, protected pages and its client/server contracts. Blog, Careers, Events, Newsletter and Reviews own their pages, components, resource metadata, endpoints and dedicated tests. Search owns its public page, prefix grammar, local public-content index, endpoint, client contract and tests. Uploads owns its client contract, UI, private local storage, inspection lifecycle, endpoints, resolver plugin and tests. Estimates and Payments own separate client contracts and API routes while reusing the explicitly shared workflow repository, service support and customer dashboard.

The Contact manifest supplies its sitemap route and management resource to shared registry consumers. Generic administration code reads labels, editable fields and routes from metadata rather than hardcoding `messages`. Reusable transport, generic form types, request limits, validation and persistence remain shared and are listed under `implementation.shared`.

Products remains an intentionally planned layer with a typed status export and no enabled runtime catalog.

## Migration rules

- Migrate one feature at a time; use Contact, Appointments and Administrator as the reference implementations.
- Move existing code and update its imports atomically. Do not leave a second implementation behind.
- The base application may import a layer's public entry point, but not optional feature internals.
- A feature may depend on base contracts or declared feature dependencies only.
- Route visibility is not authorization. Server handlers must continue checking feature state, authentication, ownership and input independently.
- Provider SDKs, credentials and adapters remain server-only within their owning feature.
- Keep `feature.ts` ownership and shared-dependency paths current throughout migration.

## Migration status summary

Contact, Appointments, Administrator, Customer, Blog, Careers, Events, Newsletter, Reviews, Search, Uploads, Estimates and Payments are migrated. Products is planned and disabled by default. Architecture tests enforce that implemented app/server paths stay under their owning layer and that feature-specific management resources are published by layer manifests.
