# Documentation Map

This file is the single entry point for all documentation in this repository.
When looking for a doc, start here. When adding a new doc, register it here.

> **For AI tools:** Read this file first when asked about documentation, upgrade
> guides, architecture decisions, or project conventions. Follow the links to the
> specific doc rather than guessing paths.

---

## Where to put new docs

| What you're writing                              | Where it goes                                |
| ------------------------------------------------ | -------------------------------------------- |
| Environment / tooling prerequisites              | `docs/setup/`                                |
| Repo structure, monorepo decisions, path guides  | `docs/architecture/`                         |
| Technology migration guide (framework, CSS, etc) | `docs/migrations/`                           |
| Upgrade status, deployment procedures, QA        | `docs/upgrades/`                             |
| SDK bundle, chunk, lazy-loading analysis         | `packages/web-sdk/docs/performance/`         |
| SDK infrastructure (CDN, CSS versioning, deps)   | `packages/web-sdk/docs/infrastructure/`      |
| SDK migration (build tools, validators)          | `packages/web-sdk/docs/migrations/`          |
| Historical SDK reorganization records            | `packages/web-sdk/docs/history/`             |
| Components-package feature plans (linkouts etc.) | `packages/components/docs/<feature-folder>/` |
| CXR widget system docs / ADRs                    | `packages/contextual-reels/docs/`            |
| Component-package QA test fixtures (XML, MP4 …)  | `packages/<name>/.storybook/qa-fixtures/`    |
| Per-package usage instructions                   | `packages/<name>/README.md`                  |
| Per-app usage instructions                       | `apps/<name>/README.md`                      |

---

## Root

| File                   | Purpose                           |
| ---------------------- | --------------------------------- |
| [README.md](README.md) | Project overview, getting started |
| [docs.md](docs.md)     | This file — documentation map     |

---

## `docs/` — General project documentation

### Setup

Environment prerequisites, tooling, and dependency management.

| File                                                                       | Purpose                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [docs/setup/NODE_VERSION.md](docs/setup/NODE_VERSION.md)                   | Node.js version requirements and setup                                     |
| [docs/setup/LINTING.md](docs/setup/LINTING.md)                             | ESLint and Prettier configuration                                          |
| [docs/setup/TSCONFIG.md](docs/setup/TSCONFIG.md)                           | TypeScript configuration — shared presets, per-package setup, path aliases |
| [docs/setup/DEPENDENCY_MANAGEMENT.md](docs/setup/DEPENDENCY_MANAGEMENT.md) | Dependency management strategy                                             |

### Architecture

Structural documentation about how the repository is organized.

| File                                                                                     | Purpose                                                          |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [docs/architecture/REPO_CONTEXT.md](docs/architecture/REPO_CONTEXT.md)                   | Full repository context and structure                            |
| [docs/architecture/MONOREPO_CONVERSION.md](docs/architecture/MONOREPO_CONVERSION.md)     | History of the monorepo conversion                               |
| [docs/architecture/PATH_RESOLUTION_GUIDE.md](docs/architecture/PATH_RESOLUTION_GUIDE.md) | Path resolution and import guide                                 |
| [docs/architecture/SAFE_SUSPENSE.md](docs/architecture/SAFE_SUSPENSE.md)                 | SafeSuspense pattern, chunk-failure resilience, lint enforcement |

### Migrations

Technology migration guides (Next.js 15, Tailwind v4, Turbopack, React Compiler).

| File                                                                                             | Purpose                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| [docs/migrations/NEXT_JS_15_CHANGES.md](docs/migrations/NEXT_JS_15_CHANGES.md)                   | Next.js 15 code changes summary      |
| [docs/migrations/NEXTJS15_CODEMODS.md](docs/migrations/NEXTJS15_CODEMODS.md)                     | Next.js 15 automated codemods guide  |
| [docs/migrations/REACT_COMPILER.md](docs/migrations/REACT_COMPILER.md)                           | React Compiler setup and usage       |
| [docs/migrations/SERVER_COMPONENTS_AND_PPR.md](docs/migrations/SERVER_COMPONENTS_AND_PPR.md)     | Server Components and PPR guide      |
| [docs/migrations/PACKAGE_IMPORT_OPTIMIZATION.md](docs/migrations/PACKAGE_IMPORT_OPTIMIZATION.md) | `optimizePackageImports` guide       |
| [docs/migrations/TAILWIND_V4_MIGRATION.md](docs/migrations/TAILWIND_V4_MIGRATION.md)             | Tailwind v4 migration status         |
| [docs/migrations/TAILWIND_V4_MIGRATION_GUIDE.md](docs/migrations/TAILWIND_V4_MIGRATION_GUIDE.md) | Tailwind v4 step-by-step guide       |
| [docs/migrations/TURBOPACK_INTEGRATION.md](docs/migrations/TURBOPACK_INTEGRATION.md)             | Turbopack integration guide          |
| [docs/migrations/TURBOPACK_TESTING_RESULTS.md](docs/migrations/TURBOPACK_TESTING_RESULTS.md)     | Turbopack compatibility test results |

### Upgrades

Operational docs for the upgrade lifecycle: tracking, deployment, and QA.

| File                                                                                     | Purpose                                |
| ---------------------------------------------------------------------------------------- | -------------------------------------- |
| [docs/upgrades/UPGRADE_STATUS.md](docs/upgrades/UPGRADE_STATUS.md)                       | Next.js 15 / React 19 upgrade progress |
| [docs/upgrades/UPGRADE_DEPLOYMENT_GUIDE.md](docs/upgrades/UPGRADE_DEPLOYMENT_GUIDE.md)   | Safe deployment procedures             |
| [docs/upgrades/UPGRADE_TESTING_CHECKLIST.md](docs/upgrades/UPGRADE_TESTING_CHECKLIST.md) | Post-upgrade testing checklist         |
| [docs/upgrades/QA_PRIORITIZED_FILES.md](docs/upgrades/QA_PRIORITIZED_FILES.md)           | QA branch prioritized file list        |

---

## `apps/webapp/` — Next.js web application

| File                                                                                 | Purpose                                |
| ------------------------------------------------------------------------------------ | -------------------------------------- |
| [apps/webapp/README.md](apps/webapp/README.md)                                       | App overview and commands              |
| [apps/webapp/UPGRADE_GUIDE.md](apps/webapp/UPGRADE_GUIDE.md)                         | Next.js 15 and React 19 upgrade guide  |
| [apps/webapp/UPGRADE_TESTING_CHECKLIST.md](apps/webapp/UPGRADE_TESTING_CHECKLIST.md) | App-specific upgrade testing checklist |

---

## `apps/legacy-webapp/` — Legacy web application

| File                                                                                               | Purpose                                |
| -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| [apps/legacy-webapp/README.md](apps/legacy-webapp/README.md)                                       | App overview and commands              |
| [apps/legacy-webapp/UPGRADE_GUIDE.md](apps/legacy-webapp/UPGRADE_GUIDE.md)                         | Next.js 15 and React 19 upgrade guide  |
| [apps/legacy-webapp/UPGRADE_TESTING_CHECKLIST.md](apps/legacy-webapp/UPGRADE_TESTING_CHECKLIST.md) | App-specific upgrade testing checklist |

---

## `packages/components/`

| File                                                           | Purpose                         |
| -------------------------------------------------------------- | ------------------------------- |
| [packages/components/README.md](packages/components/README.md) | Shared components package guide |

### Linkouts plans

Feature plans for the `molecules/linkout-new` family — scenario configs, ad slots, outside / responsive layouts. Authored as living docs alongside the implementation work; new plans go here.

| File                                                                                                                             | Purpose                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [packages/components/docs/linkouts/FULL_DYNAMIC_LINKOUT_PLAN.md](packages/components/docs/linkouts/FULL_DYNAMIC_LINKOUT_PLAN.md) | End-to-end dynamic-linkout scenario picker / state machine plan                                 |
| [packages/components/docs/linkouts/RESPONSIVE_LINKOUT_PLAN.md](packages/components/docs/linkouts/RESPONSIVE_LINKOUT_PLAN.md)     | Responsive wide-card layout matrix (size buckets + orientation)                                 |
| [packages/components/docs/linkouts/OUTSIDE_LINKOUT_PLAN.md](packages/components/docs/linkouts/OUTSIDE_LINKOUT_PLAN.md)           | Outside (below-the-frame) layout variant for embed scenarios                                    |
| [packages/components/docs/linkouts/DYNAMIC_LINKOUT_ADS_PLAN.md](packages/components/docs/linkouts/DYNAMIC_LINKOUT_ADS_PLAN.md)   | Banner / display / video ad fallback rollout for the linkout slot                               |
| [packages/components/docs/linkouts/SAMPLE_AD_TAGS.md](packages/components/docs/linkouts/SAMPLE_AD_TAGS.md)                       | Sample ad tags for QA: IMA (video) + GAM (display banner) paths                                 |
| [docs/plans/dynamic-sheet-snap/DESIGN.md](docs/plans/dynamic-sheet-snap/DESIGN.md)                                               | `SnapSheet` snap-point engine (continuous velocity-projected drag) — first consumer is linkouts |

---

## `packages/contextual-reels/` — CXR widget

| File                                                                                                                                           | Purpose                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [packages/contextual-reels/README.md](packages/contextual-reels/README.md)                                                                     | CXR widget package guide + quick start                                                                                                                                                                                 |
| [packages/contextual-reels/CLAUDE.md](packages/contextual-reels/CLAUDE.md)                                                                     | CXR AI memory map — architecture, dirs, data flow, entry points, testing                                                                                                                                               |
| [packages/contextual-reels/docs/README.md](packages/contextual-reels/docs/README.md)                                                           | CXR documentation index (single source of truth)                                                                                                                                                                       |
| [packages/contextual-reels/docs/ARCHITECTURE.md](packages/contextual-reels/docs/ARCHITECTURE.md)                                               | CXR module map — entry points, providers, feed/player/ads/controls/strategies/instance/genai                                                                                                                           |
| [packages/contextual-reels/docs/DATA_FLOW.md](packages/contextual-reels/docs/DATA_FLOW.md)                                                     | CXR end-to-end flow — tag id → boot → feed → ad → analytics                                                                                                                                                            |
| [packages/contextual-reels/docs/CONFIGURATION.md](packages/contextual-reels/docs/CONFIGURATION.md)                                             | CXR env, ad layouts, stacked layout, GIV, host macros, deploy                                                                                                                                                          |
| [packages/contextual-reels/docs/CONTRIBUTING.md](packages/contextual-reels/docs/CONTRIBUTING.md)                                               | CXR TDD, coverage gates, invariants, partner contracts, how-tos                                                                                                                                                        |
| [packages/contextual-reels/docs/STRATEGIES.md](packages/contextual-reels/docs/STRATEGIES.md)                                                   | Per-tag strategy system — toggles, the 3-layer cascade, recipes, statically-served tags, debug-device VAST feeds                                                                                                       |
| [packages/contextual-reels/tests/e2e/README.md](packages/contextual-reels/tests/e2e/README.md)                                                 | Control-icon E2E suite — harness, fixtures, real-vs-mocked, scenarios                                                                                                                                                  |
| [packages/contextual-reels/src/ads/README.md](packages/contextual-reels/src/ads/README.md)                                                     | GenAd SDK boundary — waterfall, single-hit passback, Infolinks Impression                                                                                                                                              |
| [packages/contextual-reels/src/player/README.md](packages/contextual-reels/src/player/README.md)                                               | Player lifecycle (HLS/IMA) reference                                                                                                                                                                                   |
| [packages/contextual-reels/src/feed/hooks/README.md](packages/contextual-reels/src/feed/hooks/README.md)                                       | Feed hooks reference                                                                                                                                                                                                   |
| [packages/contextual-reels/docs/AD_REMOVAL_RISK_AUDIT.md](packages/contextual-reels/docs/AD_REMOVAL_RISK_AUDIT.md)                             | Historical (2026-07-02) Heavy Ad Intervention / ad-policy risk audit — superseded on AdProvider specifics, see banner                                                                                                  |
| [packages/contextual-reels/docs/AUDIT_TRIAGE_2026-07.md](packages/contextual-reels/docs/AUDIT_TRIAGE_2026-07.md)                               | Historical (2026-07-09) production-readiness audit triage — fixed / deferred / unverified                                                                                                                              |
| [packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_TASK.md](packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_TASK.md)                             | Original problem report — iOS WKWebView "volume up, no sound" on the Infolinks 320x50 audio tag                                                                                                                        |
| [packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_PLAN.md](packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_PLAN.md)                             | `AUDIO_DIAGNOSTIC` beacon — native-vs-web fault localization, why host-side not GenAd, reading the field data                                                                                                          |
| [packages/contextual-reels/docs/ANALYTICS_QUERYING.md](packages/contextual-reels/docs/ANALYTICS_QUERYING.md)                                   | **Querying CXR analytics in ClickHouse** — `temp_adreels_logs` schema, the `data` JSON blob + flattened keys, field reference, recipes, traps                                                                          |
| [packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_FINDINGS.md](packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_FINDINGS.md)                     | Running findings log — audible-start muting: what's established, 7 overturned conclusions, data snapshots, open questions                                                                                              |
| [packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_API_COVERAGE.md](packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_API_COVERAGE.md)             | WebView audio/autoplay API coverage audit (Android + iOS) — proof no signal was missed, with compat citations; 2 plausible candidates disproved                                                                        |
| [packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_INFOLINKS_FEEDBACK.md](packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_INFOLINKS_FEEDBACK.md) | Outbound Infolinks ask — the prioritised requests, and the figures not cleared for external use                                                                                                                        |
| [packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_ANALYST_GUIDE.md](packages/contextual-reels/docs/AUDIO_DIAGNOSTIC_ANALYST_GUIDE.md)           | **Analyst entry point** — plain-English orientation, layman gloss on every beacon field, standing queries, traps                                                                                                       |
| [packages/contextual-reels/docs/VISIBILITY_DIAGNOSTIC_PLAN.md](packages/contextual-reels/docs/VISIBILITY_DIAGNOSTIC_PLAN.md)                   | `VISIBILITY_DIAGNOSTIC` beacon — every candidate viewability signal (IO v1/v2, rAF liveness, Page Visibility, MRAID/OMID, geometry) side-by-side to find which detects a natively-hidden WebView; data-collection only |
| [packages/contextual-reels/docs/VISIBILITY_DIAGNOSTIC_QUERYING.md](packages/contextual-reels/docs/VISIBILITY_DIAGNOSTIC_QUERYING.md)           | **Querying the visibility beacon in ClickHouse** — `visibility_diagnostic` field reference, "which signal flips to hidden" recipes, audio-beacon correlation join, `forced_fill` filtered opposite to the audio doc    |
| [packages/contextual-reels/docs/VISIBILITY_DIAGNOSTIC_FINDINGS.md](packages/contextual-reels/docs/VISIBILITY_DIAGNOSTIC_FINDINGS.md)           | Running findings log for the visibility investigation — first field capture, audible-but-invisible repro, IO v2 identified as the discriminating signal, rAF ruled out, MRAID absent; prevalence still open            |

### CXR decisions (ADRs)

Architecture decision records for the widget. New ADRs go in `docs/cxr-decisions/`, numbered sequentially.

| File                                                                                                                                                       | Purpose                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [packages/contextual-reels/docs/cxr-decisions/001-drop-swiper.md](packages/contextual-reels/docs/cxr-decisions/001-drop-swiper.md)                         | ADR 001 — drop Swiper                                    |
| [packages/contextual-reels/docs/cxr-decisions/002-chromium-os-quirk.md](packages/contextual-reels/docs/cxr-decisions/002-chromium-os-quirk.md)             | ADR 002 — Chromium OS quirk                              |
| [packages/contextual-reels/docs/cxr-decisions/003-mutation-observer-scope.md](packages/contextual-reels/docs/cxr-decisions/003-mutation-observer-scope.md) | ADR 003 — MutationObserver document scope                |
| [packages/contextual-reels/docs/cxr-decisions/004-e2e-real-genad.md](packages/contextual-reels/docs/cxr-decisions/004-e2e-real-genad.md)                   | ADR 004 — control-icon E2E runs against real GenAd       |
| [packages/contextual-reels/docs/cxr-decisions/005-stacked-infolinks.md](packages/contextual-reels/docs/cxr-decisions/005-stacked-infolinks.md)             | ADR 005 — stacked layout with an Infolinks in-place unit |
| [packages/contextual-reels/docs/cxr-decisions/006-l3-audio-on-unmute.md](packages/contextual-reels/docs/cxr-decisions/006-l3-audio-on-unmute.md)           | ADR 006 — L3 (320×50) audio on unmute                    |

### CXR ad-resource-budget (skill)

Heavy Ad Intervention / IAB resource-budget enforcement for CXR ad tags & creatives.

| File                                                                                                                                                                     | Purpose                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| [packages/contextual-reels/ad-resource-budget/SKILL.md](packages/contextual-reels/ad-resource-budget/SKILL.md)                                                           | Skill entry point — enforces per-build resource budgets |
| [packages/contextual-reels/ad-resource-budget/cxr/README.md](packages/contextual-reels/ad-resource-budget/cxr/README.md)                                                 | CXR-specific harness notes                              |
| [packages/contextual-reels/ad-resource-budget/scripts/README.md](packages/contextual-reels/ad-resource-budget/scripts/README.md)                                         | Measurement scripts reference                           |
| [packages/contextual-reels/ad-resource-budget/references/resource-budgets.md](packages/contextual-reels/ad-resource-budget/references/resource-budgets.md)               | Byte/CPU/request budget thresholds                      |
| [packages/contextual-reels/ad-resource-budget/references/measurement-methodology.md](packages/contextual-reels/ad-resource-budget/references/measurement-methodology.md) | How budgets are measured                                |

### CXR superpowers plans & specs

Feature plans/specs authored via the `superpowers` skill workflow (planning artifacts, not live reference).

| File                                                                                                                                                                                               | Purpose                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [packages/contextual-reels/docs/superpowers/specs/2026-07-09-cxr-host-macro-resolution-design.md](packages/contextual-reels/docs/superpowers/specs/2026-07-09-cxr-host-macro-resolution-design.md) | Design spec — host macro resolution (Triton app-param rulings) |

---

## `packages/web-sdk/` — Genuin Web SDK

| File                                                               | Purpose                             |
| ------------------------------------------------------------------ | ----------------------------------- |
| [packages/web-sdk/README.md](packages/web-sdk/README.md)           | SDK overview, build commands, usage |
| [packages/web-sdk/docs/README.md](packages/web-sdk/docs/README.md) | SDK documentation index             |

### Architecture

| File                                                                                                     | Purpose                   |
| -------------------------------------------------------------------------------------------------------- | ------------------------- |
| [packages/web-sdk/docs/architecture/ARCHITECTURE.md](packages/web-sdk/docs/architecture/ARCHITECTURE.md) | SDK architecture overview |

### Performance

Bundle size, chunk splitting, lazy loading, and performance measurement.

| File                                                                                                                                       | Purpose                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| [packages/web-sdk/docs/performance/PERFORMANCE_BASELINE.md](packages/web-sdk/docs/performance/PERFORMANCE_BASELINE.md)                     | Baseline bundle size measurements      |
| [packages/web-sdk/docs/performance/PERFORMANCE_IMPROVEMENTS.md](packages/web-sdk/docs/performance/PERFORMANCE_IMPROVEMENTS.md)             | Performance improvements summary       |
| [packages/web-sdk/docs/performance/SDK_LAZY_LOADING_OPTIMIZATION.md](packages/web-sdk/docs/performance/SDK_LAZY_LOADING_OPTIMIZATION.md)   | Lazy loading optimization plan         |
| [packages/web-sdk/docs/performance/CHUNK_ANALYSIS.md](packages/web-sdk/docs/performance/CHUNK_ANALYSIS.md)                                 | Per-chunk analysis and recommendations |
| [packages/web-sdk/docs/performance/CHUNK_LOADING_ANALYSIS.md](packages/web-sdk/docs/performance/CHUNK_LOADING_ANALYSIS.md)                 | Chunk loading behavior analysis        |
| [packages/web-sdk/docs/performance/CODE_SPLITTING_IMPLEMENTATION.md](packages/web-sdk/docs/performance/CODE_SPLITTING_IMPLEMENTATION.md)   | Code splitting implementation          |
| [packages/web-sdk/docs/performance/SINGLE_BUNDLE_BUILD_PLAN.md](packages/web-sdk/docs/performance/SINGLE_BUNDLE_BUILD_PLAN.md)             | Single bundle build plan               |
| [packages/web-sdk/docs/performance/VENDOR_CHUNK_SPLITTING_SUMMARY.md](packages/web-sdk/docs/performance/VENDOR_CHUNK_SPLITTING_SUMMARY.md) | Vendor chunk splitting summary         |

### Infrastructure

CDN, CSS versioning, and dependency management.

| File                                                                                                                                       | Purpose                       |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| [packages/web-sdk/docs/infrastructure/BUNNY_CDN_PURGING.md](packages/web-sdk/docs/infrastructure/BUNNY_CDN_PURGING.md)                     | Bunny CDN cache purging guide |
| [packages/web-sdk/docs/infrastructure/CSS_PATH_VERSIONING.md](packages/web-sdk/docs/infrastructure/CSS_PATH_VERSIONING.md)                 | CSS path versioning strategy  |
| [packages/web-sdk/docs/infrastructure/DEPENDENCY_CLEANUP_ANALYSIS.md](packages/web-sdk/docs/infrastructure/DEPENDENCY_CLEANUP_ANALYSIS.md) | Dependency cleanup analysis   |

### Migrations

| File                                                                                                                                                   | Purpose                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| [packages/web-sdk/docs/migrations/ROLLUP_V4_MIGRATION_CHECKLIST.md](packages/web-sdk/docs/migrations/ROLLUP_V4_MIGRATION_CHECKLIST.md)                 | Rollup v4 migration checklist       |
| [packages/web-sdk/docs/migrations/LEGACY_VALIDATION_INTEGRATION_SUCCESS.md](packages/web-sdk/docs/migrations/LEGACY_VALIDATION_INTEGRATION_SUCCESS.md) | Legacy validation integration notes |

### History

Historical records of past reorganization efforts (not active reference material).

| File                                                                                                                                       | Purpose                        |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| [packages/web-sdk/docs/history/WEB_SDK_REORGANIZATION_ACTION_PLAN.md](packages/web-sdk/docs/history/WEB_SDK_REORGANIZATION_ACTION_PLAN.md) | Reorganization action plan     |
| [packages/web-sdk/docs/history/WEB_SDK_REORGANIZATION_SUCCESS.md](packages/web-sdk/docs/history/WEB_SDK_REORGANIZATION_SUCCESS.md)         | Reorganization success report  |
| [packages/web-sdk/docs/history/REORGANIZATION_COMPLETE.md](packages/web-sdk/docs/history/REORGANIZATION_COMPLETE.md)                       | Reorganization completion note |
| [packages/web-sdk/docs/history/REORGANIZATION_STATUS_UPDATE.md](packages/web-sdk/docs/history/REORGANIZATION_STATUS_UPDATE.md)             | Reorganization status update   |
| [packages/web-sdk/docs/history/README_REORGANIZATION_COMPLETE.md](packages/web-sdk/docs/history/README_REORGANIZATION_COMPLETE.md)         | README reorganization complete |

---

## `scripts/`

| File                                                           | Purpose                          |
| -------------------------------------------------------------- | -------------------------------- |
| [scripts/POSTINSTALL_README.md](scripts/POSTINSTALL_README.md) | Post-install script instructions |

---

## `.claude/` — Claude Code configuration

> Authored directly (no sync step, no generator). Claude Code reads these on session start / on
> demand. See [docs/claude-setup-plan.md](docs/claude-setup-plan.md) for the migration rationale.

| File                                                     | Purpose                                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [.claude/CLAUDE.md](.claude/CLAUDE.md)                   | Project rules, conventions, guardrails, agent/skill awareness                       |
| [.claude/docs/ai-context.md](.claude/docs/ai-context.md) | React/Next.js patterns, Tailwind v4, env vars                                       |
| [.claude/agents/](.claude/agents/)                       | Specialist subagents (planner, implementer, debugger, …)                            |
| [.claude/skills/README.md](.claude/skills/README.md)     | **Skills & agents catalog** — all 16 skills + 9 agents with trigger phrases         |
| [.claude/skills/](.claude/skills/)                       | Domain skills (debug, e2e-testing, frontend-patterns, …)                            |
| [.claude/codebase-map.md](.claude/codebase-map.md)       | Living, team-shared codebase knowledge Claude reads/updates (codebase-memory skill) |
