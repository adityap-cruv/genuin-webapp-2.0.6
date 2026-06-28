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

| File                                                                                     | Purpose                               |
| ---------------------------------------------------------------------------------------- | ------------------------------------- |
| [docs/architecture/REPO_CONTEXT.md](docs/architecture/REPO_CONTEXT.md)                   | Full repository context and structure |
| [docs/architecture/MONOREPO_CONVERSION.md](docs/architecture/MONOREPO_CONVERSION.md)     | History of the monorepo conversion    |
| [docs/architecture/PATH_RESOLUTION_GUIDE.md](docs/architecture/PATH_RESOLUTION_GUIDE.md) | Path resolution and import guide      |
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

| File                                                                                                                             | Purpose                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [packages/components/docs/linkouts/FULL_DYNAMIC_LINKOUT_PLAN.md](packages/components/docs/linkouts/FULL_DYNAMIC_LINKOUT_PLAN.md) | End-to-end dynamic-linkout scenario picker / state machine plan   |
| [packages/components/docs/linkouts/RESPONSIVE_LINKOUT_PLAN.md](packages/components/docs/linkouts/RESPONSIVE_LINKOUT_PLAN.md)     | Responsive wide-card layout matrix (size buckets + orientation)   |
| [packages/components/docs/linkouts/OUTSIDE_LINKOUT_PLAN.md](packages/components/docs/linkouts/OUTSIDE_LINKOUT_PLAN.md)           | Outside (below-the-frame) layout variant for embed scenarios      |
| [packages/components/docs/linkouts/DYNAMIC_LINKOUT_ADS_PLAN.md](packages/components/docs/linkouts/DYNAMIC_LINKOUT_ADS_PLAN.md)   | Banner / display / video ad fallback rollout for the linkout slot |
| [packages/components/docs/linkouts/SAMPLE_AD_TAGS.md](packages/components/docs/linkouts/SAMPLE_AD_TAGS.md)                       | Sample ad tags for QA: IMA (video) + GAM (display banner) paths   |

---

## `packages/contextual-reels/` — CXR widget

| File                                                                                         | Purpose                                                          |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [packages/contextual-reels/README.md](packages/contextual-reels/README.md)                   | CXR widget package guide                                         |
| [packages/contextual-reels/docs/STRATEGIES.md](packages/contextual-reels/docs/STRATEGIES.md) | Per-tag strategy system — toggles, the 3-layer cascade, recipes |
| [packages/contextual-reels/docs/PROJECT.md](packages/contextual-reels/docs/PROJECT.md)       | CXR project context                                             |
| [packages/contextual-reels/tests/e2e/README.md](packages/contextual-reels/tests/e2e/README.md) | Control-icon E2E suite — harness, fixtures, real-vs-mocked, scenarios |

### CXR decisions (ADRs)

Architecture decision records for the widget. New ADRs go in `docs/cxr-decisions/`, numbered sequentially.

| File                                                                                                                                                       | Purpose                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [packages/contextual-reels/docs/cxr-decisions/001-drop-swiper.md](packages/contextual-reels/docs/cxr-decisions/001-drop-swiper.md)                         | ADR 001 — drop Swiper                     |
| [packages/contextual-reels/docs/cxr-decisions/002-chromium-os-quirk.md](packages/contextual-reels/docs/cxr-decisions/002-chromium-os-quirk.md)             | ADR 002 — Chromium OS quirk               |
| [packages/contextual-reels/docs/cxr-decisions/003-mutation-observer-scope.md](packages/contextual-reels/docs/cxr-decisions/003-mutation-observer-scope.md) | ADR 003 — MutationObserver document scope |
| [packages/contextual-reels/docs/cxr-decisions/004-e2e-real-genad.md](packages/contextual-reels/docs/cxr-decisions/004-e2e-real-genad.md)                   | ADR 004 — control-icon E2E runs against real GenAd |

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

| File                                                     | Purpose                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| [.claude/CLAUDE.md](.claude/CLAUDE.md)                   | Project rules, conventions, guardrails, agent/skill awareness |
| [.claude/docs/ai-context.md](.claude/docs/ai-context.md) | React/Next.js patterns, Tailwind v4, env vars                 |
| [.claude/agents/](.claude/agents/)                       | Specialist subagents (planner, implementer, debugger, …)      |
| [.claude/skills/README.md](.claude/skills/README.md)     | **Skills & agents catalog** — all 16 skills + 9 agents with trigger phrases |
| [.claude/skills/](.claude/skills/)                       | Domain skills (debug, e2e-testing, frontend-patterns, …)      |
| [.claude/codebase-map.md](.claude/codebase-map.md)       | Living, team-shared codebase knowledge Claude reads/updates (codebase-memory skill) |
