# Contextual Reels (CXR) — Documentation

Single source of truth for the `@genuin/contextual-reels` package: an embeddable "contextual
reels" ad/video widget delivered as a CDN IIFE (`gen_ext.min.js`) that self-boots into an
isolated React tree per `.gen-ext` mount point on a partner page.

> **Read order for a newcomer (human or LLM):** [ARCHITECTURE](ARCHITECTURE.md) →
> [DATA_FLOW](DATA_FLOW.md) → [CONFIGURATION](CONFIGURATION.md) → [CONTRIBUTING](CONTRIBUTING.md).
> The package-root [`../CLAUDE.md`](../CLAUDE.md) is the compressed memory-map version of this set.

## Map

| Doc | What's in it |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module map: entry points, the two provider stacks, feed/player/ads/controls/strategies/instance-coordination/genai, and cross-cutting utilities. Start here. |
| [DATA_FLOW.md](DATA_FLOW.md) | End-to-end flow: tag id → boot → config → feed load → render → ad insertion → analytics/pixels → cross-instance coordination. |
| [CONFIGURATION.md](CONFIGURATION.md) | Env vars & the triple env-loading model, `AD_LAYOUT` L1–L4, the stacked-Infolinks layout, `GIV` initial-volume, host macros, and deploy pipeline. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | TDD workflow, per-file coverage thresholds, key invariants, **partner contracts (never change)**, how-to guides, and the "what not to do" list. |
| [STRATEGIES.md](STRATEGIES.md) | The per-tag strategy/feature-flag system: 3-layer cascade, presets, experiments, key table. |
| [cxr-decisions/](cxr-decisions/) | Architecture Decision Records (ADRs 001–006) — the *why* behind load-bearing choices. |
| [AUDIT_TRIAGE_2026-07.md](AUDIT_TRIAGE_2026-07.md) | Point-in-time production-readiness triage. Kept for its still-open deferred/backend items. |
| [AD_REMOVAL_RISK_AUDIT.md](AD_REMOVAL_RISK_AUDIT.md) | Chrome Heavy-Ad-Intervention (HAI) root-cause audit + open ad-ops/backend questions. |
| [superpowers/specs/](superpowers/specs/) | Design spec for host-macro / Triton app-param resolution (carries design rulings not in code). |
| [../ad-resource-budget/](../ad-resource-budget/) | The HAI/IAB resource-budget measurement harness (skill + references + CXR wiring). |

## Testing

- Unit/component: **Vitest + jsdom**, colocated `*.test.ts(x)` next to each source file. Run `pnpm test`,
  `pnpm test:coverage` (per-file thresholds in [`../vitest.config.ts`](../vitest.config.ts)).
- E2E: **Playwright** against the built `dist/`. See [`../tests/e2e/README.md`](../tests/e2e/README.md)
  and [ADR 004](cxr-decisions/004-e2e-real-genad.md).
- Per-module READMEs with deeper local detail: [`../src/ads/README.md`](../src/ads/README.md),
  [`../src/player/README.md`](../src/player/README.md), [`../src/feed/hooks/README.md`](../src/feed/hooks/README.md).
