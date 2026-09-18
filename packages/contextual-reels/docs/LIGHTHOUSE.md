# CXR Lighthouse baseline — 2026-08-17

CXR now has its own Lighthouse harness: [`lighthouse/`](../lighthouse/), modelled on the
[`ad-resource-budget/`](../ad-resource-budget/) harness (same `tags.mjs` axes, same
`server.mjs` static server). `pnpm lighthouse` runs Lighthouse (desktop + mobile) across
the full `CXR_TAGS × CXR_SIZES` matrix (3 tags × 3 sizes = 9 cells), averages every score
and core metric across all 9, and fails if the average regresses past tolerance against
the committed baseline ([`lighthouse/lighthouse-baseline.json`](../lighthouse/lighthouse-baseline.json)).
`pnpm lighthouse:save-baseline` re-measures and overwrites that baseline.

This replaces the single ad-hoc run this doc used to describe. [`scripts/run-lighthouse.sh`](../../../scripts/run-lighthouse.sh)
still exists for **web-sdk** only and is unrelated to this harness; the pre-push hook's
Lighthouse step is still commented out (see [`TESTING.md`](TESTING.md#pre-push--every-git-push)) —
this check is **manual**, like `pnpm budget:all` and `pnpm fixtures:check`, because it
takes several minutes and hits the live QA ad exchange for real fill.

Companion perf doc: the [ad resource budget](TESTING.md#1213-ad-resource-budget--pnpm-budget--pnpm-budgetall)
(`pnpm budget`), which is the _gated_ CXR performance check. Lighthouse measures page
experience; the budget measures Heavy Ad Intervention risk. They are not substitutes.

---

## At a glance — averaged across the full matrix

Averaged across all **9 cells** (`CXR_TAGS` × `CXR_SIZES` — `ads-only`, `video+ad`,
`video-only` each at `320×50`, `320×100`, `320×480`; see [`tags.mjs`](../ad-resource-budget/cxr/tags.mjs)).
This is the committed baseline in [`lighthouse/lighthouse-baseline.json`](../lighthouse/lighthouse-baseline.json) —
`pnpm lighthouse` re-measures the same matrix and fails if the new average regresses past
tolerance (see [Gating](#gating-pnpm-lighthouse)).

| Category       | Desktop | Mobile |
| -------------- | ------: | -----: |
| Performance    |  **70** | **63** |
| Accessibility  |      87 |     87 |
| Best Practices |      96 |     96 |
| SEO            |      80 |     80 |

## Metrics (9-cell average)

| Metric                   | Desktop |  Mobile |
| ------------------------ | ------: | ------: |
| First Contentful Paint   |  1.50 s |  3.62 s |
| Largest Contentful Paint |  3.38 s |  7.07 s |
| Total Blocking Time      |    0 ms |   20 ms |
| Cumulative Layout Shift  |  0.0003 |  0.0001 |
| Speed Index              |  3.11 s |  7.28 s |
| JS bootup time           |   68 ms |  441 ms |
| Main-thread work         |  385 ms | 1365 ms |
| Total byte weight        | 2.05 MB | 1.86 MB |

Total byte weight is the **noisiest** metric here on purpose — every cell hits the live QA
ad exchange for real fill (same as the [ad-resource-budget](../ad-resource-budget/) harness),
so creative size varies run to run independent of any code change. See
[Reading](#reading) and the tolerance note in
[`run-lighthouse.mjs`](../lighthouse/cxr/run-lighthouse.mjs).

---

## Reading

- **9-cell averaging smooths per-tag noise, not per-run noise.** A single Lighthouse run
  per cell against a live ad exchange still has real variance (a heavier/lighter creative
  landing, a layout-shift blip) — averaging 9 cells narrows it but doesn't eliminate it.
  Re-running the full matrix twice in a row moved the desktop performance average by ~8
  points during baseline validation; treat single-digit swings as noise, not signal.
- **CLS and TBT sit near zero across the matrix** — the widget neither blocks the main
  thread nor shifts layout in the common case. Most of the performance score loss is paint
  latency (FCP/LCP/Speed Index), especially on mobile's 4× CPU / throttled-network profile.
- **These are dev-build numbers** (`pnpm build`, not `build:prod`) — unminified, source
  maps, dev API env. Re-measure on a prod build before drawing release conclusions.
- **One tag/size cell can skew the mean.** `320×50` (L3, no player) and `320×480` (L5, full
  player) have very different resource profiles by design — a regression in only one
  layout still moves the 9-cell average, which is intentional (the baseline is meant to
  catch a regression in any layout, not just the "typical" one).

## Gating (`pnpm lighthouse`)

`pnpm lighthouse` (from `packages/contextual-reels`) builds `dist/` (skip with
`--skip-build` if you already have a fresh build), runs the 9-cell matrix, averages, and
compares against the committed baseline. Regression rules (see
[`run-lighthouse.mjs`](../lighthouse/cxr/run-lighthouse.mjs)):

- **Score categories** (performance/accessibility/best-practices/SEO) regress if the new
  average drops more than **5 points** below baseline.
- **Timing/byte metrics** regress if the new average exceeds
  `max(baseline × 1.2, baseline + floor)` — a 20% relative band with an absolute floor per
  metric (e.g. TBT floor 150 ms, byte-weight floor 150 KiB) so near-zero baselines don't
  trip on run-to-run jitter alone.

`pnpm lighthouse:save-baseline` re-measures and overwrites `lighthouse-baseline.json` —
run it deliberately after a real, reviewed change to the widget's resource profile, not to
silence a failing gate.

This is a **manual** check, like `pnpm budget:all` and `pnpm fixtures:check` — not wired
into pre-push or CI. It takes several minutes and fires real QA ad requests per cell; run
it when touching the mount path, bundle chunking, or anything upstream of first paint.

## Against the web-sdk thresholds

[`scripts/check-lighthouse.js`](../../../scripts/check-lighthouse.js) gates the **web-sdk**,
not CXR — CXR has its own baseline now (above), this table is kept only as a cross-package
reference point:

| Threshold        | Desktop limit | CXR desktop | Mobile limit | CXR mobile |
| ---------------- | ------------: | ----------: | -----------: | ---------: |
| Performance      |          0.60 |     0.70 ✅ |         0.60 |    0.63 ✅ |
| Accessibility    |          0.80 |     0.87 ✅ |         0.80 |    0.87 ✅ |
| Best Practices   |          0.80 |     0.96 ✅ |         0.80 |    0.96 ✅ |
| SEO              |          0.60 |     0.80 ✅ |         0.60 |    0.80 ✅ |
| FCP              |      3 000 ms |    1 501 ✅ |     4 500 ms |   3 624 ✅ |
| LCP              |      4 500 ms |    3 378 ✅ |    30 000 ms |   7 071 ✅ |
| TBT              |        500 ms |        0 ✅ |       800 ms |      20 ✅ |
| CLS              |          0.25 |   0.0003 ✅ |         0.25 |  0.0001 ✅ |
| Speed Index      |      5 000 ms |    3 113 ✅ |     8 000 ms |   7 281 ✅ |
| JS bootup        |      2 000 ms |       68 ✅ |     2 000 ms |     441 ✅ |
| Main-thread work |      4 000 ms |      385 ✅ |     4 000 ms |   1 365 ✅ |

Desktop and mobile both clear the web-sdk thresholds comfortably. SEO/accessibility scores
are largely a property of the harness page (a single empty `<div>` mount), not the widget,
so do not over-read them — they exist mainly so a future regression (e.g. missing `lang`,
a contrast issue in an injected control) still shows up.

---

## Run configuration

|              | Desktop                                                     | Mobile           |
| ------------ | ----------------------------------------------------------- | ---------------- |
| Lighthouse   | via `npx lighthouse`, repo-pinned version                   |
| Preset       | `--preset=desktop`                                          | default (mobile) |
| CPU slowdown | 1×                                                          | 4×               |
| Categories   | performance, accessibility, best-practices, seo (same both) |

Matrix under test: all 3 `CXR_TAGS` (`ads-only`, `video+ad`, `video-only`) × all 3
`CXR_SIZES` (`320×50` → L3, `320×100` → L4, `320×480` → L5) — see
[`ad-resource-budget/cxr/tags.mjs`](../ad-resource-budget/cxr/tags.mjs), reused as-is by
the Lighthouse harness. Every number in this doc is the mean across those 9 cells, one
Lighthouse run per cell per form factor.

## Caveats

1. **Dev build by default.** `pnpm lighthouse` runs `pnpm build` (development mode) unless
   called with `--skip-build` against an already-built `dist/`. Unminified code and source
   maps inflate script bytes and parse cost; a `build:prod`-based run would score higher.
   Point `run-lighthouse.mjs`'s `runBuild()` at `build:prod` if a release-representative
   baseline is needed instead.
2. **Live ad exchange, single run per cell.** Every cell hits the real QA ad exchange for
   fill — same tradeoff the [ad-resource-budget](../ad-resource-budget/) harness makes.
   Byte weight and, less often, paint timing move noticeably between two back-to-back runs
   of the full matrix (see [Reading](#reading)). The gate's tolerance (20% relative + an
   absolute floor per metric) is sized around that, not around a hypothetical zero-noise
   world.
3. **Localhost.** No CDN, no real network to the origin — only the ad/analytics calls go
   out. Real publisher pages carry their own content weight on top.
4. **Harness page is minimal.** Each cell's page is just the widget's mount `<div>` plus
   its loader script, so the widget owns 100% of LCP. Embedded in a real article it would
   rarely be the LCP element.
5. **Gated, but manually.** `pnpm lighthouse` exits 1 on a regression (see
   [Gating](#gating-pnpm-lighthouse)), but nothing runs it automatically — it is not wired
   into pre-push or CI, the same status as `pnpm budget:all` and `pnpm fixtures:check`.

## Reproduce

```bash
cd packages/contextual-reels

# Full matrix, builds dist/ first, compares to the committed baseline:
pnpm lighthouse

# Reuse an existing dist/ build (faster iteration):
pnpm lighthouse --skip-build

# Re-measure and overwrite the committed baseline after a real, reviewed change
# to the widget's resource profile:
pnpm lighthouse:save-baseline
```

Runtime: ~30–40 s per cell (desktop + mobile Lighthouse run each) × 9 cells ÷ concurrency
(default 2) ≈ 3–4 minutes for the full matrix, plus the build if not skipped. Per-cell
implementation: [`lighthouse/scripts/run-one.mjs`](../lighthouse/scripts/run-one.mjs)
(single tag × size, desktop + mobile); [`lighthouse/cxr/run-lighthouse.mjs`](../lighthouse/cxr/run-lighthouse.mjs)
(matrix runner, averaging, baseline compare). Raw per-cell Lighthouse JSON reports are not
persisted — only the averaged summary is (and only when `--save-baseline` is passed).

To change the surface under test, swap `data-tag-id` and the mount `width`/`height` — the
size drives which ad layout resolves (`resolveAdLayout` in [`src/config.ts`](../src/config.ts)).
