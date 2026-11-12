# Package and toolchain decisions

This document replaces the original package evaluation checklist with implemented decisions. Remaining external integration work is tracked in [remaining-work.md](remaining-work.md).

| Area               | Decision                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime            | Node 24 LTS, npm 12.0.2, checked-in lockfile, `npm ci` in CI                                                                                                                         |
| Framework          | Nuxt/Vue with SSR and strict Nuxt-generated TypeScript project references                                                                                                            |
| Styling            | Tailwind through Vite; semantic CSS tokens; Prettier owns formatting                                                                                                                 |
| Images             | `@nuxt/image` through application wrappers; local image optimization                                                                                                                 |
| Icons              | Explicit tree-shakeable `@tabler/icons-vue` imports; a second icon module adds no current value                                                                                      |
| Fonts              | System fonts by default; `useUIFonts` handles configured font files; no default external font service/module                                                                         |
| Forms              | Typed serializable schemas and focused local validation; Zod/form-state packages are not needed by current consumers                                                                 |
| Rich content       | Structured blocks plus Nuxt MDC for database Markdown and shared prose; markdown-it remains used by server rendering helpers                                                         |
| Complex controls   | Reka supplies dialogs/focus, menus, popovers, tooltips and tabs; do not add a parallel focus/positioning framework                                                                   |
| Dates              | Native Intl and pure hour/slot/event helpers; no general date dependency                                                                                                             |
| API                | Ofetch, normalized errors and provider-independent factories; no CMS/payment/auth/storage/newsletter SDK in the core                                                                 |
| SEO                | Existing metadata helper plus typed JSON-LD builders and native Nitro discovery routes; no duplicate SEO abstraction/module                                                          |
| Lint               | Official `@nuxt/eslint` flat config plus focused project exceptions                                                                                                                  |
| Tests              | Node/tsx for contracts/transport/state; Playwright for actual Nuxt browser integration and axe scans; Vitest/Vue Test Utils/Nuxt Test Utils would duplicate current responsibilities |
| CI                 | Lint, unit tests, strict typecheck/build and browser workflows; test artifacts retained on failure                                                                                   |
| Privacy            | No analytics/advertising SDK; external maps/video opt in; future tracking must wait for consent                                                                                      |
| Optional utilities | Phone masking, extra input utilities and provider packages require a real client consumer                                                                                            |

`npm run check` runs required local checks. `npm run format:check` is separate so formatting and correctness remain distinct. Tooling is in devDependencies. Runtime dependencies also include the integrated Markdown/MDC rendering tools; consult package.json and package-lock.json for the current inventory. Review major updates individually rather than forcing a dependency solver across incompatible framework versions.

## Dependency audit, 2026-10-10

The initial audit reported 17 advisories. Compatible `npm audit fix` updates reduced that to 14 (7 high, 7 critical), including transitive framework/development dependencies. Remaining chains involve simple-git/@simple-git/argv-parser, braces/micromatch/glob tooling, and node-forge/listhen/Nitro. npm proposes a breaking downgrade to Nuxt 3.7.4 for some chains; that was not applied. These findings are outstanding, not cleared by lint/typecheck/browser success. Re-run `npm audit` and assess upstream patched releases before production use.

References: [official Nuxt ESLint setup](https://eslint.nuxt.com/packages/module), [Schema.org LocalBusiness](https://schema.org/LocalBusiness), [Event](https://schema.org/Event), [JobPosting](https://schema.org/JobPosting).

## Current follow-up tracking

The advisory counts above are historical observations dated 2026-10-10, not a fresh scan. OPS-03 in [integration-audit.md](integration-audit.md) tracks a new dependency review and pinned secret-scanning gates. OPS-02 tracks mandatory authenticated integration fixtures in CI. Do not treat passing unit/build checks as proof these operational items are complete.
