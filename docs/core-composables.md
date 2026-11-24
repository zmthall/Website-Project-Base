# Core composables

## Implemented locally

Call composables from component setup, another composable or a Nuxt plugin. Register head metadata in a valid setup context. In particular, `useUITheme` is called from the root component rather than an initialization plugin; moving it back can break head context during hydration.

| Composable                         | Responsibility                                             | Source/state                                                         |
| ---------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `useSiteConfig`                    | Deeply readonly public site configuration                  | `shared/data/site.ts`                                                |
| `useFeature`                       | Reactive explicit feature checks                           | Site feature flags; administrator/customer provider values handled separately |
| `useBusiness`                      | Location/contact/address display fallbacks                 | Public business configuration                                        |
| `useNavigation`                    | Visibility, ordering, route activity and action resolution | Public navigation plus supplied auth state                           |
| `useWebsiteUI`                     | Runtime theme/section preview state                        | Serializable app defaults; preview is not database persistence       |
| `useColorMode`                     | User/system/light/dark preference                          | Cookie and configured mode                                           |
| `useUITheme` / `useUIFonts`        | Root theme attributes/tokens and optional font faces       | UI config and font-file sources                                      |
| `useSEO`                           | Reactive metadata/canonical resolution                     | Site defaults plus page values                                       |
| `useStructuredData`                | Escaped reactive JSON-LD with stable head keys             | Explicit visible published records                                   |
| `useAdminAuth` / `useCustomerAuth` | Access to separate injected auth stores                    | Local session API and client restoration                             |
| `useAdminManagement`               | CSRF-authorized CMS/settings operations                    | Local admin APIs                                                     |
| `useNewsletterContent`             | Latest published issue presentation or sample fallback     | Local public-content API                                             |
| `useWorkflows`                     | Customer workflow API factories and local CSRF transport   | `/api/workflows`                                                     |
| `useWorkflowKey`                   | Stable logical-request retry key                           | Browser-local state; server enforces idempotency                     |

## Usage

```ts
const site = useSiteConfig();
const enabled = useFeature('appointments');
const selectedLocation = ref<string>();
const business = useBusiness(selectedLocation);

useSEO(() => ({ title: 'Our services', description: site.seo?.description }));
```

`useBusiness` selects a primary/first location when no ID is provided, avoids silently substituting an unknown requested location, and applies per-field business contact fallbacks. Presentation helpers do not authorize data access.

Navigation resolves shared route/external/phone/email/anchor/download actions. It rejects unsafe schemes, applies recursive visibility and active-route state, and preserves link/download attributes. Components own focus, disclosure and navigation events. Supply consistent initial auth state across SSR and hydration.

`useSEO` accepts an object/ref/getter. Page values override site defaults, canonical origin comes from configured `site.url`, and changing reactive input replaces stale head entries. `useStructuredData` is a separate builder: pass only real visible content and avoid publishing sample ratings/events as verified data.

The local workflow composable obtains CSRF for writes. It does not turn the process-local repository into durable storage, and its simulation results do not establish real provider completion. See [workflows.md](workflows.md).

## What remains

- THEME-01: authorized theme editing, versioning and durable SSR-safe storage if required.
- API-01/API-02: consistent local/external transports and runtime schemas.
- AUTH-01–03: shared sessions, provider/recovery adapters and account administration.
- SEO-01/CONTENT-01: authoritative published content and reviewed production origin/assets.
- A11Y-01: real Safari/screen-reader verification of state/focus transitions.

Acceptance criteria and anchors: [integration-audit.md](integration-audit.md).

## Verification

Unit tests cover configuration utilities, actions, routing, SEO and state helpers. Browser suites cover runtime theme changes, navigation, forms and customer workflows. Use `npm run check` and relevant browser tests; automated checks do not prove real provider integration or manual accessibility.
