# CXR test suite — categories, purpose, and execution times

Reference for the whole `@genuin/contextual-reels` test surface: what each category
covers, when to run it, and how long it actually takes. Every number below was
**measured**, not estimated — see [Measurement method](#measurement-method) for the
machine and the caveats that make times move.

Companion docs: [`TEST_SETUP.md`](TEST_SETUP.md) (how the framework works end to end —
architecture, environments, flows, conventions; the onboarding read),
[`tests/e2e/README.md`](../tests/e2e/README.md) (E2E operational
guide + coverage matrix), [`CONTRIBUTING.md`](CONTRIBUTING.md) (TDD workflow and
coverage gates), [ADR 004](cxr-decisions/004-e2e-real-genad.md) (why E2E runs
against real GenAd).

---

## At a glance

| #   | Category                           | Command                                   |             Tests |         Typical wall time | Runs where                   |
| --- | ---------------------------------- | ----------------------------------------- | ----------------: | ------------------------: | ---------------------------- |
| 1   | Typecheck                          | `pnpm typecheck`                          |                 — |                   **3 s** | pre-push (root)              |
| 2   | Lint                               | `pnpm lint` (`eslint src/ tests/`)        |                 — |                   **9 s** | pre-push + `lint.yml`        |
| 3   | Unit + component                   | `pnpm test`                               | 2256 in 134 files |               **13–18 s** | local                        |
| 4   | Unit + coverage gates              | `pnpm test:coverage`                      |              2256 |                  **23 s** | **pre-push**                 |
| 5   | Fixture contract                   | part of #3 (`tests/unit/`)                |                19 |                 **< 1 s** | with #3                      |
| 6   | Mock self-tests                    | part of #3 (`tests/_mocks/`)              |                26 |                 **< 1 s** | with #3                      |
| 7   | Bundle build (E2E prerequisite)    | `pnpm build` / `turbo build --filter=…`   |                 — |       **6 s** / 12 s warm | before #10 / #13             |
| 8   | E2E — desktop                      | `playwright test --project=chromium`      |                39 |                 **110 s** | with #10                     |
| 9   | E2E — mobile                       | `playwright test --project=mobile-chrome` |                18 |                  **98 s** | with #10                     |
| 8b  | E2E — WebKit (`@routing` only)     | `playwright test --project=webkit`        |                 8 |                  **21 s** | with #10                     |
| 10  | E2E — full suite (local, parallel) | `pnpm test:e2e`                           |                65 |           **1.9–2.7 min** | local + **CI (label-gated)** |
| 11  | E2E — as CI runs it                | `CI=true pnpm test:e2e --workers=2`       |                65 |               **4.2 min** | mirrors the workflow         |
| 12  | Ad resource budget (HAI)           | `pnpm budget`                             |          7 checks |                  **96 s** | local                        |
| 13  | Ad resource budget — full matrix   | `pnpm budget:all`                         |          36 cells |              **19.0 min** | **local, manual**            |
| 18  | Fixture drift vs live QA           | `pnpm fixtures:check`                     |            6 tags |                   **5 s** | **local, manual**            |
| 14  | Storybook                          | `pnpm storybook`                          |           1 story | not part of the test loop | —                            |
| 15  | Formatting                         | `npx prettier --check .`                  |                 — |                   **4 s** | local                        |
| 16  | Env validation                     | `pnpm validate:env`                       |                 — |                   **5 s** | build:qa / :prod             |
| 17  | Bundle-size report                 | `node scripts/track-bundle-size.mjs`      |                 — |                 **< 1 s** | manual                       |

**Pre-push gate** (what every push runs — [`.husky/pre-push`](../../../.husky/pre-push)):
#2 + #4 ≈ **32 s** for this package, inside a ~3.5-minute repo-wide hook. Full
breakdown, and what the CI job costs: [Gate timings](#gate-timings-measured-2026-08-15).
**Full local confidence** (widget behaviour changed): add #7 + #10 ≈ **1.5 min more**. E2E
also runs in CI, but only on demand — [`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml)
fires on `workflow_dispatch` or a PR labelled `run-e2e-all` **and** `pkg:contextual-reels`.
Unit tests and the budget matrix have no CI at all. See
[Where each check runs](#where-each-check-runs).

> **No root command runs this package's tests.** Root `pnpm test` covers only web-sdk
> and webapp — see [How this is invoked from the repo root](#how-this-is-invoked-from-the-repo-root).
> Beyond the automated categories there are also
> [manual verification surfaces](#manual-verification-surfaces) (dev harness, preview
> pages, post-deploy CDN check).

---

## 1. Typecheck — `pnpm typecheck`

**What it is.** `tsc --noEmit` over the package in strict mode.

**Why it earns its place.** It is the only check that covers the type-only files
(`control-layer.types.ts`, `feed/slide-types.ts`, `player/types.ts`) — they have no
executable lines, so no test can cover them and coverage reports them as 0%. It is
also the fastest way to catch a wire-shape mistake in the API types.

**When.** Every change. It is 4 seconds. Already covered by the root
`pnpm typecheck` step in [`.husky/pre-push`](../../../.husky/pre-push) (turbo fans
out to this package), so it is not duplicated in the CXR block there.

**Time.** 4 s (no incremental cache benefit worth relying on).

---

## 2. Lint — `pnpm lint`

**What it is.** `eslint src/ tests/` with the shared `@genuin/eslint-config`, including the
repo rule that bans a bare `<Suspense>` in favour of `SafeSuspense`.

**Scope gap to know about.** The script covers `src/` only. `eslint tests/` currently
errors on undefined Playwright globals because no flat-config entry covers that
directory — tracked in the E2E README's deferred table.

**When.** Every change. Enforced twice: the CXR block in
[`.husky/pre-push`](../../../.husky/pre-push), and the root `lint.yml` workflow.

**Time.** 5 s.

---

## 3. Unit + component tests — `pnpm test`

**What it is.** Vitest in jsdom over 126 test files — colocated `*.test.ts(x)` next
to the source, plus three harness guards under `tests/`. This is the bulk of the
suite and the default place to add a test.

Rendering convention: raw React (`createRoot` + `act`), **not**
`@testing-library/react`. Hook and context values are captured into a module
variable through a `Consumer` component. Copy a sibling test rather than inventing
setup.

**What it covers.** Everything from pure functions (`config.ts`'s layout resolver,
`utils/`) through hooks (`feed/hooks/`, `monitoring/`) to full component trees with
mocked providers (`feed/layouts/`, `controls/`, `providers/`). Layout branching — all
of `AD_LAYOUT.L1`–`L5` plus `Unknown` — is asserted here first; E2E then proves the
same routing in a real browser.

**When.** Continuously while developing (`pnpm test:watch`), and before every push.

**Time.** 13–18 s wall for the whole suite. A single file is **4–5 s**, nearly all of
it fixed cost: jsdom environment setup plus transform dominate, while the assertions
themselves total ~7 s across all 2256 tests.

Per-directory shape (test counts; execution time per directory is under 1 s each):

| Directory                                                       | Files | Tests |
| --------------------------------------------------------------- | ----: | ----: |
| `src/ads`                                                       |     7 |   279 |
| `src/feed` (+ `hooks`, `layouts`)                               |    16 |   300 |
| `src/controls` (+ `ad`, `bottombar`, `topbar`, `buttons/atoms`) |    20 |   274 |
| `src/strategies`                                                |     6 |   175 |
| `src/providers`                                                 |    10 |   172 |
| `src` (root: config, publicApi, userId, shadow-dom, hostMacros) |     6 |   136 |
| `src/player`                                                    |     4 |   136 |
| `src/monitoring`                                                |     6 |   104 |
| `src/genai/octo`                                                |     7 |    90 |
| `src/utils`                                                     |     8 |    82 |
| `src/app`                                                       |     8 |    81 |
| `src/analytics`                                                 |     3 |    75 |
| `src/platform`                                                  |     2 |    63 |
| `src/instance` (+ `coordination`, `registry`)                   |     8 |    58 |
| `src/observability`                                             |     2 |    44 |
| `src/services`                                                  |     2 |    43 |
| `tests/_mocks` + `tests/unit`                                   |    10 |    51 |
| `src/__fixtures__`                                              |     1 |     9 |

---

## 4. Unit + coverage gates — `pnpm test:coverage`

**What it is.** #3 plus v8 coverage **and the per-file thresholds** in
[`vitest.config.ts`](../vitest.config.ts): 100% for `ads/`, `analytics/`, `services/`,
`config/`, `player/`, `utils/`, `device/`; 95/90/95/95 for `providers/`; 90/80/100/90
globally.

**Why it is a separate category.** The thresholds are the actual gate, and they only
run under coverage. Current state: **99.63% statements, 97.35% branches, 100%
functions** overall.

**Trap worth knowing.** A failing test short-circuits the threshold check, so a red
suite hides a coverage regression. Fix failures first, then trust the gate.

**When.** Automatically on every push (the CXR block in
[`.husky/pre-push`](../../../.husky/pre-push) runs this, not plain `pnpm test`,
precisely because the thresholds only exist here). Also run it whenever you add or
delete a source file — a new file with no test fails its directory's gate.

**Time.** 23 s — a few seconds over #3; v8 coverage is cheap here.

---

## 5. Fixture contract test — `tests/unit/feedFixtures.test.ts`

Two harness guards live in `tests/unit/` and run inside #3:
`feedFixtures.test.ts` (below) and `mountWidgetOverrides.test.ts`, which covers the
E2E harness's `applyTagOverrides` — the fixture patch L2-PRECEDENCE depends on to reach the L2
Octo path.

**What it is.** Walks every committed `*.feed.json` — 10 statically-served tags, 2
debug-device feeds, and the 7 E2E fixtures — through the real `normaliseFeed`,
asserting each yields renderable slides with dense ids and a known `kind`.

**Why it exists.** Fixtures are JSON, so TypeScript cannot check them. This is the
only thing standing between a malformed fixture and a runtime break in a real embed.

**When.** Automatically with #3. Keep it green when adding any fixture.

**Time.** < 1 s (19 tests).

---

## 6. Mock self-tests — `tests/_mocks/*.test.ts`

**What it is.** Eight tests that assert the shared test doubles (hls, vlitejs, GenAd,
IMA, Rudderstack, axios, GenAI SDK, window events) still behave the way the suite
assumes.

**Why it exists.** A silently-drifted mock makes hundreds of tests pass against a
fiction. These fail loudly instead.

**When.** Automatically with #3; specifically after upgrading any mocked dependency.

**Time.** < 1 s (26 tests).

---

## 7. Bundle build — `pnpm build`

**Not a test, but a prerequisite.** Playwright serves the built `dist/`, so E2E runs
against stale code unless you build first.

**The trap.** pnpm 8 does **not** run `pre`/`post` scripts, so `pnpm build` skips
`prebuild` — it neither cleans `dist/` nor builds `@genuin/genai-sdk`. That is fine
locally (the sibling dist is already there) and wrong on a fresh clone, because
`src/styles/tailwind.css` imports `@genuin/genai-sdk/styles`. CI therefore builds via
`pnpm turbo build --filter=@genuin/contextual-reels`, whose `dependsOn: ["^build"]`
builds the workspace dependency first and caches both.

**Time.** 5 s for `pnpm build` alone; 16 s for the turbo path with a warm cache
(4 tasks, 2 cached). Budget more on a cold CI cache.

---

## 8–11. End-to-end — Playwright

**What it is.** The built CDN bundle in a real browser. Only the tag config and feed
are mocked (captured QA responses); the **GenAd SDK, the live ad waterfall, and
Bunny-CDN HLS media all run for real** — see [ADR 004](cxr-decisions/004-e2e-real-genad.md)
and its 2026-08-15 amendment. Rudderstack is stubbed, so E2E runs no longer emit
real events into production analytics. **65 tests across 7 specs**: one per ad layout
(`l1.300x600` … `l5.320x480`), plus `publicApi` (host-facing partner contract)
and `init` (bundle smoke).

**What it covers that unit tests cannot.** Shadow-DOM mounting, layout resolution
from a real slot's `offsetWidth/Height`, the stacked-variant DOM split, real ad fill
and completion-driven advance, actual `<video>` volume, and fullscreen transitions.
Every `AD_LAYOUT` including `Unknown` and both stacked shapes is exercised — the
matrix lives in [`tests/e2e/README.md`](../tests/e2e/README.md).

**What it now also covers.** The strategy layer, previously untested end to end:
`visibilityGate` / `unit_hidden` passback / `destroyOnHide`, `mutePassback`,
`adsDisabled`, `feedLoopEnabled`, `suppressedEvents`, `servedStatically`,
`genAiEnabled`. Reached through a localhost-gated seam
(`src/strategies/testOverrides.ts`) that layers a `cxr_strategies` URL patch as the
last step of the cascade.

**Three projects.** `chromium` (Desktop Chrome) runs 39; `mobile-chrome` (Pixel 5
— touch, mobile UA, 393×851) re-runs the 18 tagged `@mobile`, i.e. the phone-only
formats L3/L4/L5 and the 320×100 stacked shape, with real `touchscreen.tap`
events; `webkit` (Desktop Safari) runs the 8 tagged `@routing` — layout
resolution and bundle bootstrap, the cases that need neither media nor ad fill.
WebKit is scoped that way on purpose: those assertions give a genuine
cross-browser signal, whereas the audio specs would mostly retell how Safari
handles autoplay. Widening it is worthwhile but expect real differences.

**When.** After changing anything in the mount path, layouts, controls, or the ad
integration. Either run it locally, or push with the `run-e2e-all` label so
[`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml) runs it
([Where each check runs](#where-each-check-runs)). **Nothing runs it automatically** —
that is deliberate: each run costs real QA ad requests.

**Times.**

| Scope                                  |       Wall time |
| -------------------------------------- | --------------: |
| `init.spec.ts` (bundle presence)       |             3 s |
| One spec, one project (`l3.320x50`)    |            25 s |
| `--project=chromium` (39 tests)        |      **~110 s** |
| `--project=mobile-chrome` (18 tests)   |        **98 s** |
| `--project=webkit` (8 tests)           |        **21 s** |
| Full suite, local parallel (4 workers) | **1.9–2.7 min** |

Slowest tests are the ones waiting on real ad completion: `L3-SINGLE-HIT` and
`L4-NO-LOOP` both raise their own timeout to 120 s because a completion-driven
advance takes 15–30 s of real ad time.

**Worker count is the one lever that matters**, because the suite's cost is waiting
on real media and real ad fill rather than CPU. Measured locally on the PREVIOUS
41-test suite at `--retries=0` — directionally still valid, but re-measure before
changing `--workers` now that the suite is 65 tests:

| Workers | Wall  | Speed-up |
| ------- | ----- | -------- |
| 1       | 235 s | —        |
| 2       | 122 s | 1.9×     |
| 4       | 67 s  | 3.5×     |

Locally the default (`workers: undefined` → `ceil(cores/2)`, i.e. 4 here) is what you
get. `playwright.config.ts` pins `workers: 1` under `CI=true` for stability;
[`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml) overrides that to
`--workers=2`. **The table above is from an 8-core laptop and does not transfer to the
2-vCPU runner** — 3 workers was measured there and rejected (182 s vs 192 s at 2, a 5%
gain, while one video-feed spec failed outright in both projects). Video decode is genuinely
CPU-bound, so the runner cannot absorb a third worker. See
[What the CI job does](#what-the-ci-job-does).

**Two setup requirements, both of which look like product bugs when missed:**

1. The suite serves `dist/` on **3111** (since 2026-08-14; it was 3011, which `pnpm dev`
   kept taking — Vite asks for 3010 and drifts upward). If anything else owns 3111,
   run `CXR_E2E_PORT=3131 pnpm test:e2e`: `reuseExistingServer` would otherwise hand the
   suite that server, which serves an app shell instead of `dist/gen_ext.min.js`, and
   every test times out on mount. The `globalSetup` guard
   [`tests/e2e/support/assertDistServer.ts`](../tests/e2e/support/assertDistServer.ts)
   catches this (and a missing `dist/`) in ~1 s with the fix in the message, instead of
   50 identical 15 s timeouts.
2. Never use `page.waitForFunction` in this suite; use `waitUntil`/`pollUntil` from
   [`tests/e2e/support/poll.ts`](../tests/e2e/support/poll.ts). Playwright polls
   `waitForFunction` on `requestAnimationFrame`, and rAF stops being delivered for
   the slot once the widget mounts — a false predicate then hangs past its own
   timeout and the failure surfaces on an unrelated line.

---

## 12–13. Ad resource budget — `pnpm budget` / `pnpm budget:all`

**What it is.** A Playwright-driven measurement harness
([`ad-resource-budget/`](../ad-resource-budget/)) that loads the tag like a publisher
would and scores it against two sets of limits: **Chrome Heavy Ad Intervention**
(4 MB transferred, 60 s total CPU, 15 s CPU in any 30 s window — `error` severity,
never raise these) and IAB New Ad Portfolio targets (`warn`). Exits non-zero if a
non-interacted cell breaches an `error` limit.

**Why it matters more than it looks.** HAI unloads the ad frame outright, so a
breach is lost revenue, not a slow page. The HLS buffer caps and active-slide-only
`startLoad` in the player exist to stay under these limits — this harness is what
proves they still do.

**When.** After anything touching media loading, ad requests, or bundle size. Needs a
current `dist/` (`pnpm budget:build` does both).

### Known breaches as of 2026-08-13 (product findings, not test failures)

`budget:all` currently **exits 1** — recorded here so nobody reads a red scorecard as
a broken harness. Measured on `release/genuin-sdk/2.0.6`, 3 runs/cell:

| Cell                     | Grade |          Not interacted |                Interacted | Note                                              |
| ------------------------ | ----- | ----------------------: | ------------------------: | ------------------------------------------------- |
| `ads-only` @ 320×100     | **F** | 8.16–9.58 MB (204–240%) | 12.15–14.32 MB (304–358%) | 720p MP4 ad creatives; **gates the build**        |
| `ads-only` @ 320×480     | **F** | 9.20–9.51 MB (230–238%) | 10.24–11.42 MB (256–285%) | same cause; **gates the build**                   |
| `ads-only` @ 320×50      | A / B |           1.54 MB (39%) |     2.14–2.69 MB (53–67%) | audio-only `.mp3` creatives — the healthy profile |
| `video+ad` (all sizes)   | **A** |     472–538 KB (12–13%) |       473–911 KB (12–22%) | comfortable                                       |
| `video-only` (all sizes) | **A** |      295–535 KB (7–13%) |        295–915 KB (7–22%) | comfortable                                       |

Only the four non-interacted `ads-only` cells at 320×100 / 320×480 fail the gate
(interacted cells are informational). The heaviest single request in each is a
1.26–3.04 MB Bunny-CDN media file.

> **This differs from the numbers previously recorded on `feature/preview-bcc`**, where
> `video-only` @ 320×100 sat at 103% of HAI when interacted. On this branch that cell
> measures 817 KB (20%) — our own media loading is well inside budget here, and the
> only breach left is creative size. Re-measure before quoting either set.

**The ads-only leak is creative size, not our code path.** The same tag returns audio
creatives at 320×50 but **720p MP4 video** at 320×100 and 320×480 — one creative
(up to ~3 MB) is most of the HAI budget for a 320 px-wide slot. It then multiplies
because audio-only layouts auto-advance (`useInactivityAdvance`, ~10 s) and ad slides
also advance on completion, so a 30 s HAI window walks 2–3 slides and loads a fresh
creative each time. The MP4s come from the exchange, not our feed (the ads-only
fixture carries only the VAST tag URL).

Contributing bug on our side: `isAudioOnlyAds` (`L3 || L4`, `AdProvider.tsx`) is
consumed **only** to arm the inactivity advance — it never reaches the ad request. So
at L4 we declare the unit audio-only, render no player for it, and still accept 720p
video. Threading it into the request would take that cell to roughly the 320×50
profile, but it changes what inventory we ask for, so it is an ad-ops/product
decision, not a code cleanup.

**Our own media loading is at the floor.** `usePlayerLifecycle` pins the _lowest_
rendition (`hls.currentLevel = lowestIdx`) with `maxBufferLength: 4`,
`maxBufferSize: 1 MB` and `capLevelToPlayerSize: true`. That is why every
`video-only` and `video+ad` cell grades A. Don't "optimise" these caps again — if a
`video-only` cell ever does breach, the fix is a lower CDN rendition, not a code
change.

**Times.**

- `pnpm budget` — one tag at 320×100, 3 runs, ~31 s observation each: **96 s**.
  Current result: **PASS** — 533 KB / 4 MB transferred, 192 KB initial, 14 initial
  requests, 29 subloads, no warnings.
- `pnpm budget:all` — the full matrix: 3 tags × 3 sizes (320×50, 320×100, 320×480) ×
  2 view modes (direct, publisher iframe) × 2 interaction states = **36 cells** at
  concurrency 4. **Measured 19m 01s** at the default 3 runs/cell (31.7 s/cell avg);
  6m 23s at `--runs 1`. The run prints its own
  `Total time … · N cells · …/cell avg · concurrency N` line at the end. Treat it as a
  nightly job (that is where CI runs it), not a per-change check.
- One tag per variation (`ad-resource-budget/cxr/tags.mjs`), **not** two — the two-per-
  scenario map is the E2E harness's `TAG`. Note the budget's `video+ad` cell uses
  `6a3aa86e4da8cd92d289ccda`, which is E2E's `videoPlusAdAlt`, so the two suites
  measure different tags for that variation.
- `pnpm budget:throttled` runs cells one at a time under 4× CPU throttling, so expect
  roughly 4× the matrix time.

---

## 14. Storybook

`pnpm storybook` / `pnpm build-storybook` exist and `@storybook/addon-vitest` is
installed, but the package has **one** story file — Storybook is not a meaningful
coverage surface here today, and it is not part of any test loop. Not timed.

---

## 15. Formatting — `pnpm format`

**What it is.** `prettier --write .` over the package. Verify-only:
`npx prettier --check .`.

**Read this before running it.** **77 files in this package already fail
`prettier --check`** — `ad-resource-budget/`, most of `scripts/`, several `src/` files
and docs. `pnpm format` therefore rewrites ~77 files and buries
your change in unrelated diff noise. Format the paths you touched
(`npx prettier --write <file>`), not the package, until someone does a dedicated
formatting sweep.

**Time.** 4 s to check the whole package.

---

## 16. Env validation — `pnpm validate:env`

**What it is.** `scripts/validateEnv.ts` asserts the env file for the current
`NODE_ENV` has every variable the build needs.

**When.** Automatic — `predev` runs it before `pnpm dev`, and `prebuild:qa` /
`prebuild:prod` run it before a QA or production build. It is deliberately **not** in
the plain `pnpm build` path (the development build tolerates a partial env).

**Why it counts as a check.** It is the only thing standing between a missing
`VITE_CXR_*` value and a bundle that ships pointing at nothing.

**Time.** ~5 s.

---

## 17. Bundle-size report — `node scripts/track-bundle-size.mjs`

**What it is.** Reads `dist/` and prints a markdown table of raw + gzip size per
`.js`/`.css` chunk. Reporting only — **no thresholds, no failure mode**, and it is
not wired to any npm script.

**When.** Manually, after a build, when you want a size delta to paste into a PR.
For an actual size _gate_, use the ad resource budget (#12) — its
`transferredBytesTotal` limit is the enforced one.

**Time.** < 1 s (needs a current `dist/`).

---

## Where each check runs

| Check                             | Where                                                                       | Trigger                                    |                                   Time |
| --------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------: |
| #1 Typecheck                      | [`.husky/pre-push`](../../../.husky/pre-push) (root turbo step)             | every `git push`                           |                                    3 s |
| #2 Lint                           | [`.husky/pre-push`](../../../.husky/pre-push) **and** root `lint.yml`       | every `git push` / every PR                |                                    9 s |
| #4 Unit + coverage gates          | [`.husky/pre-push`](../../../.husky/pre-push)                               | every `git push`                           |                                   23 s |
| #10 E2E (65 tests)                | your machine **or** [`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml) | manual / `workflow_dispatch` / labelled PR | 1.9 min local · 4.2 min at CI settings |
| #13 Ad resource budget (36 cells) | **your machine**                                                            | manual                                     |                                 19 min |
| #18 Fixture drift                 | **your machine**                                                            | manual                                     |                                    5 s |

**E2E has CI as of 2026-08-13; nothing else does.**
[`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml) runs the full 65-test suite on
`workflow_dispatch`, or on a PR carrying **both** the `run-e2e-all` and
`pkg:contextual-reels` labels (the latter applied automatically by `auto-label-pr.yml`
when the diff touches this package). It is opt-in precisely because every run fires
real QA ad requests. Root `lint.yml` is the only other CI touching this code. So:

> Before pushing a change to the mount path, layouts, controls or the ad integration,
> either run `pnpm build && pnpm test:e2e` yourself or add the `run-e2e-all` label.
> For `pnpm budget:all` after touching media loading, ad requests or bundle size,
> local is the only option — nothing else will run it.

`.husky/pre-push` deliberately stops at lint + coverage (~20 s for this package).
E2E and the budget matrix are not in it because they need a built `dist/` and fire
real QA ad requests, which would make every push slow and cost real inventory.
`SKIP_CXR_CHECKS=1 git push` bypasses the block.

### What the CI job does

Measured facts behind [`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml) — and the
checklist for the budget job, which is still unwired:

- **A `CXR_ENV_DEVELOPMENT` secret is required** — the 14 `VITE_CXR_*` / `VITE_*` keys
  from `.env.development.example`, written to
  `packages/contextual-reels/.env.development`. `GEN_AI_ENV` (already used by
  `e2e-web-sdk.yml`) covers `packages/genai/.env.development`. The development build
  reads both through `env-cmd` and fails without them.
- **Build via `pnpm turbo build --filter=@genuin/contextual-reels`**, never
  `pnpm --filter … build` — see the `prebuild` trap in [#7](#7-bundle-build--pnpm-build).
- **Cache `~/.cache/ms-playwright` before `pnpm install`**, keyed on `pnpm-lock.yaml`
  (which pins the Playwright version the browser build must match). Apt system
  libraries are not cacheable, so `install --with-deps` still runs on a cache hit.
- **`pnpm install` runs with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`** — the monorepo
  postinstall otherwise pulls all four engines; the job installs Chromium only.
- **`--workers=2`, and don't raise it without re-measuring on the runner.** The config
  pins `workers: 1` under CI; 2 measures ~192 s. **3 was tried and rejected**: 182 s
  (a 5% gain) while one video-feed spec failed outright in both projects. Video decode is real CPU
  work, so a 2-vCPU runner does not absorb a third worker — the 4-worker figure in
  [#8–11](#811-end-to-end--playwright) is from an 8-core laptop. Don't shard either:
  setup is ~2 min and every shard pays it, so two shards floor near 3.5 min while
  billing double.
- **The report upload is `continue-on-error` under `if: always()`**, so an artifact
  storage-quota error cannot fail an otherwise-green job. 7-day retention, artifact
  name `cxr-playwright-report`.
- **Pass `--concurrency 2` to the budget matrix, not the default 4.**
  `cpuTotalSeconds` and `cpuPeakWindowSeconds` are `error`-severity HAI limits, and
  four browsers contending on a 2-vCPU runner inflates exactly the numbers being
  gated, producing false breaches. (The harness already forces concurrency 1 under
  CPU throttling for the same reason.)
- **Label-gate rather than paths-filter**, so a PR that doesn't touch this package
  costs nothing and no run fires real QA ad requests without a human asking for it.
  That is what `run-e2e-all` + `pkg:contextual-reels` do today; a budget job should be
  gated the same way.
- Setup (install + browsers + build) is ~2 min warm; add that to every job estimate.

---

## Manual verification surfaces

Not automated, but part of how this widget gets verified. None are timed.

| Surface                                         | What it is for                                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` → [`index.html`](../index.html)      | Primary dev harness — mounts the widget against a live tag.                                                                |
| [`preview-demo.html`](../preview-demo.html)     | Dashboard-preview mode (the stand-in IMA creative path).                                                                   |
| [`iframe-preview.html`](../iframe-preview.html) | The widget inside a publisher-style iframe — the cross-origin/`window.top` path.                                           |
| [`slot-320x100.html`](../slot-320x100.html)     | Bare L4 slot, minimal page around it.                                                                                      |
| `pnpm verify:cdn` → `public/cdn-verify.html`    | **Post-deploy** check that the published bundle loads from the CDN. Serves on :8799; override with `?host=&version=&tag=`. |

---

## How this is invoked from the repo root

Worth knowing exactly, because one of these is a trap:

| Root command                             | Includes CXR?                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` (`turbo run lint`)           | **Yes**                                                                                                                                                                                                                                                                                 |
| `pnpm typecheck` (`turbo run typecheck`) | **Yes**                                                                                                                                                                                                                                                                                 |
| `pnpm build` (`turbo run build`)         | **Yes**                                                                                                                                                                                                                                                                                 |
| `pnpm test`                              | **NO** — it fans out to `@genuin/web-sdk` and `@genuin/webapp` only (and those two Playwright suites have pre-existing failures of their own). There is no turbo `test` task, so **no root command runs this package's 2256 tests** — `.husky/pre-push` invokes them by filter instead. |
| `pnpm check-build`                       | No — `scripts/check-chunk-size.js` reads `packages/web-sdk/dist` only.                                                                                                                                                                                                                  |

---

## Excluded on purpose

- [`tests/e2e/legacy/`](../tests/e2e/legacy/) — two pre-Playwright `.legacy.js` files,
  excluded via `testIgnore` in [`playwright.config.ts`](../playwright.config.ts). Kept
  for reference; they do not run and are not maintained.
- **Release operations, not checks**: `publish:qa` / `publish:prod` /
  `publish:interactive:*`, `purge:bunny:*`, `deploy:qa` / `deploy:prod`. They ship or
  invalidate the bundle and verify nothing. (`deploy:*` does run `build:*`, which runs
  `validate:env` — #16.) Listed here so the enumeration of the package's 34 scripts is
  complete: every other script maps to a category above.
- `src/loader.jsx`, `src/index.jsx`, `src/stories/**`, `src/__fixtures__/**`, `*.d.ts`,
  `types.ts` — excluded from coverage in [`vitest.config.ts`](../vitest.config.ts),
  each with a reason inline there. The one behavioural decision that used to live in
  `index.jsx` was extracted to `app/resolveSlotMount.ts` so it could be unit-tested.

---

## What is NOT covered

Deliberate gaps, so nobody assumes otherwise. Full rationale in the deferred table in
[`tests/e2e/README.md`](../tests/e2e/README.md).

| Gap                                            | Status                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accessibility (axe) scan**                   | Deferred by decision. Needs `@axe-core/playwright` (new dependency → team approval) and an owner for the findings.                                                                                                                                                                                                                                |
| **Real touch events**                          | `mobile-chrome` gives mobile UA + viewport + `hasTouch`, but the page object still taps via `page.mouse.click`.                                                                                                                                                                                                                                   |
| **Visual regression**                          | Not recommended: real third-party creatives change per impression, so snapshots would be permanently red.                                                                                                                                                                                                                                         |
| **CI for unit + budget**                       | Open, by decision (2026-08-15). CI runs only the label-gated E2E job ([`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml)); unit + lint gate in `.husky/pre-push` instead, and `budget:all` / `fixtures:check` stay manual — the budget matrix is ~19 min of real ad inventory, which is an ad-ops cost rather than a per-push or per-PR one. |
| **SY-1 / NF-1** (forced system-mute / no-fill) | Not reproducible against a real always-filling ad; the latch logic is unit-covered.                                                                                                                                                                                                                                                               |
| **In-stream / mid-roll ad break (AB-1)**       | Open gap. `useFullscreenAdBreak` is live on this branch, but the break triggers on a content position the short QA clip + headless playback never reaches. Needs a longer QA clip; unit-covered meanwhile.                                                                                                                                        |
| **`eslint` over `tests/`**                     | No flat-config entry covers it yet.                                                                                                                                                                                                                                                                                                               |

---

## Gate timings (measured 2026-08-15)

What each gate actually costs end to end, so the "is this worth automating?"
question can be answered with numbers. Same machine and caveats as
[Measurement method](#measurement-method); re-measure rather than trusting these
after a dependency bump or a CI runner change.

### Pre-push — every `git push`

The whole hook, not just this package. The CXR share is the last two rows.

| Step                                          |                       Warm |             Cold |
| --------------------------------------------- | -------------------------: | ---------------: |
| `.env` presence checks (root + web-sdk)       |                      < 1 s |            < 1 s |
| `pnpm typecheck` (root turbo, whole repo)     |                       43 s |             43 s |
| web-sdk `build:prod`                          |                       17 s |             17 s |
| webapp `turbo build`                          |                      117 s |            134 s |
| `pnpm check-build` (chunk size)               |                       12 s |             12 s |
| **CXR** `pnpm lint` (`eslint src/ tests/`)    |                        9 s |              9 s |
| **CXR** `pnpm test:coverage` (2256 + gates)   |                       23 s |             23 s |
| `pnpm lighthouse` ([baseline](LIGHTHOUSE.md)) | 0 s — manual, not run here |              0 s |
| **Total**                                     |           **≈ 3 min 30 s** | **≈ 3 min 45 s** |

Two things worth noting:

- **CXR is 32 s of ~3.5 min.** The cost is the pre-existing typecheck plus two
  production builds. Adding more CXR checks here is cheap in relative terms;
  the hook is already dominated by something else.
- **Turbo caching barely helps.** The webapp build is only 17 s faster warm, so
  "cold clone" and "just pulled main" cost about the same.

Bypasses: `SKIP_CXR_CHECKS=1` skips the CXR block only; `git push --no-verify`
skips the entire hook.

### CI — `e2e-cxr.yml`, the only workflow touching this package

Fires on `workflow_dispatch`, or a PR labelled **both** `run-e2e-all` and
`pkg:contextual-reels`. It does **not** run on an ordinary PR.

| Step                                               |                     Est. |
| -------------------------------------------------- | -----------------------: |
| checkout + pnpm + node + `pnpm install`            |                 ~60–90 s |
| write `CXR_ENV_DEVELOPMENT` + `GEN_AI_ENV` secrets |                    < 1 s |
| Playwright browsers, Chromium + WebKit (cache hit) |                    ~20 s |
| ↳ same, cache miss                                 |                    ~90 s |
| `turbo build --filter=@genuin/contextual-reels`    | 12 s local, slower on CI |
| **65 E2E tests at `--workers=2`**                  |          **251 s local** |
| upload report artifact                             |                     ~5 s |
| **Total**                                          |       **≈ 6–8 min warm** |

Job timeout is 20 min, so there is real headroom.

**Treat the 251 s as a floor.** It is this machine, not the runner. GitHub's
standard runner is 2 vCPU and this suite does real video decode — the previous
41-test suite measured ~192 s there. 65 tests at the same per-test cost lands
nearer 300 s, plus two tests that raise their own timeout to 120 s waiting on a
real ad to complete. Re-measure on the first real run.

### Manual — nothing runs these automatically

| Command               |              Time | Why it is not automated                                                                 |
| --------------------- | ----------------: | --------------------------------------------------------------------------------------- |
| `pnpm test:e2e`       | 251 s (+ `build`) | Needs a built `dist/`; CI covers it behind the label                                    |
| `pnpm fixtures:check` |              ~5 s | Live QA read. Cheap — simply not wired anywhere yet                                     |
| `pnpm budget:all`     |       **~19 min** | 36 cells × 30 s observe, every one a real QA ad request                                 |
| `pnpm lighthouse`     |          ~3–4 min | 9 cells × 2 Lighthouse runs, every one a real QA ad request ([baseline](LIGHTHOUSE.md)) |

### The gap this leaves

**Nothing gates a pull request.** Unit tests, lint and coverage live only in
pre-push, which `SKIP_CXR_CHECKS=1` and `--no-verify` both bypass; the E2E
workflow needs two labels to fire. A PR can therefore merge with zero CXR checks
having run.

That is a deliberate current state, not a regression — it was true before
2026-08-15 as well. Recorded here so the trade-off is visible rather than
rediscovered.

---

## Measurement method

- **Machine.** Apple M3 (Mac15,12), 8 cores, 16 GB RAM, macOS 25.5, Node 22.20,
  Vitest 2.1.9, Playwright 1.58.2. Baseline measured 2026-08-13 on
  `release/genuin-sdk/2.0.6`; refreshed 2026-08-15 on `feature/test-update` after
  the E2E rebuild (41 → 65 tests, 2172 → 2256 unit tests) — see
  [Gate timings](#gate-timings-measured-2026-08-15).
- **Repeats.** Typecheck, lint, unit and build were run 2–3× and the observed range is
  quoted. E2E figures come from a full run plus per-project runs; the serialised
  figure is from `CI=true`, and the worker table from `--workers=N --retries=0`.
- **Every number here is a local measurement except two.** The CI figures — ~192 s at
  `--workers=2` and 182 s at 3 — were measured on the `ubuntu-latest` 2-vCPU runner by
  `e2e-cxr.yml`. The `~2 min warm setup` figure in
  [What the CI job does](#what-the-ci-job-does) is still an estimate from the sibling
  `e2e-web-sdk.yml` job.
- **Warm caches.** `pnpm install` had already run and `dist/` existed. A cold clone
  adds install time (minutes) and a Playwright browser download.
- **What moves these numbers.** Vitest scales with cores (it is worker-parallel).
  **E2E depends on the QA ad server and Bunny CDN** — a slow fill or a stalled segment
  shows up directly in wall time, so treat E2E numbers as a band, not a constant. The
  budget harness is _deliberately_ time-bound (30 s observation per run), so its
  duration is set by config, not by machine speed.
- **Flakiness.** The suite currently passes with `--retries=0` both parallel and
  serialised. Three races were fixed to get there (an rAF-polling hang, a
  mid-transition carousel read in `waitForAdvance`, and an audible-start icon read
  before the SDK reported volume); if you see a new intermittent failure, suspect a
  missing bounded wait before suspecting the product.
