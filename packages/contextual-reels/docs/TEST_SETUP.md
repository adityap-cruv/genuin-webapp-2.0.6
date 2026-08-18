# CXR test setup — end-to-end guide

How testing works in `@genuin/contextual-reels`: the architecture, the environments, every test
type, the flows a test actually takes, where files live, how runs are executed and reported, and the
conventions you are expected to follow when adding tests.

**Who this is for.** Someone joining the widget who needs a complete mental model in one read.
It is the "how the framework works" companion to three narrower docs:

| Doc                                                | What it owns                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| [TESTING.md](TESTING.md)                           | The catalogue: every category, measured run times, what CI runs    |
| [`../tests/e2e/README.md`](../tests/e2e/README.md) | E2E operational guide: scenario matrix, expected outcomes per step |
| [CONTRIBUTING.md](CONTRIBUTING.md)                 | TDD workflow, coverage thresholds, invariants, partner contracts   |
| [ADR 004](cxr-decisions/004-e2e-real-genad.md)     | Why E2E runs against the real GenAd exchange instead of a stub     |

> **Current as of 2026-08-14.** [`.github/workflows/e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml)
> runs the full E2E suite on demand (see [CI](#71-github-actions--e2e-cxryml)); the unit suite and the
> budget matrix are still not in CI. TESTING.md and the E2E README carried a stale "no CI at all"
> claim from 2026-08-13 and were corrected alongside this doc — if you find another copy of it
> anywhere, it is wrong.

---

## 1. Testing architecture

Three independent layers, each answering a question the layer below cannot.

```
┌─ Layer 3 · Ad resource budget ─────────────────────────────────────────┐
│  Playwright-driven measurement of a real publisher embed.              │
│  Question: does a live embed stay under Chrome Heavy Ad Intervention?  │
│  Real: everything (bundle, ad exchange, CDN media, publisher iframe).  │
└────────────────────────────────────────────────────────────────────────┘
┌─ Layer 2 · E2E (Playwright) ───────────────────────────────────────────┐
│  Built `dist/gen_ext.min.js` in a real Chromium, real Shadow DOM.      │
│  Question: does the shipped bundle mount, route layouts, and behave?   │
│  Mocked: tag config + feed + ip_info.   Real: GenAd SDK, HLS media.    │
└────────────────────────────────────────────────────────────────────────┘
┌─ Layer 1 · Unit + component (Vitest + jsdom) ──────────────────────────┐
│  Source modules and React trees, in-process, everything external faked.│
│  Question: is each unit's logic and branching correct?                 │
│  Mocked: hls.js, vlitejs, GenAd, IMA, Rudderstack, axios, GenAI SDK.   │
└────────────────────────────────────────────────────────────────────────┘
```

Three design decisions explain most of what follows:

1. **Layer 1 owns branch coverage, layer 2 owns reality.** Every `AD_LAYOUT` branch (L1–L5 plus
   `Unknown`) is asserted first in Vitest, then re-proved in a real browser by E2E — because layout
   resolution reads a real slot's `offsetWidth/offsetHeight`, which jsdom cannot produce.
2. **E2E mocks the feed and nothing else** ([ADR 004](cxr-decisions/004-e2e-real-genad.md)). The ad
   waterfall and Bunny-CDN media run for real, so an ad control bar only appears on a genuine fill
   and an ad slide advances on genuine completion. Cost: each run fires real QA ad requests, and
   wall time is partly the ad server's. Benefit: fill, volume, and completion wiring are proven, not
   simulated.
3. **The bundle is the unit under test at layer 2.** Playwright serves the built `dist/`, never the
   dev server — so E2E is only meaningful after `pnpm build`.

---

## 2. Test environments

| Aspect     | Layer 1 (Vitest)                            | Layer 2 (Playwright)                               | Layer 3 (budget)                          |
| ---------- | ------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| Runtime    | Node + **jsdom**                            | Real Chromium (Desktop Chrome + Pixel 5 emulation) | Real Chromium via `playwright-core`       |
| Under test | TypeScript source (`src/`), via Vite        | Built `dist/gen_ext.min.js`                        | Built `dist/` inside a publisher page     |
| Server     | none                                        | `npx serve dist -l 3111 --cors`                    | harness's own static server               |
| Config     | [`vitest.config.ts`](../vitest.config.ts)   | [`playwright.config.ts`](../playwright.config.ts)  | `ad-resource-budget/scripts/budgets.json` |
| Globals    | **`globals: false`** — import from `vitest` | Playwright `test`/`expect` imports                 | plain Node scripts (`.mjs`)               |
| Path alias | `@cxr/*` → `src/*`                          | n/a (tests talk to the DOM, not modules)           | n/a                                       |
| Network    | fully faked                                 | tag/feed/ip_info intercepted; ad + media real      | everything real                           |

### 2.1 Vitest environment setup

[`tests/_setup/vitest.setup.ts`](../tests/_setup/vitest.setup.ts) is the only global setup file. It
is deliberately small — two things:

- **A canvas 2D-context stub.** jsdom does not implement `getContext("2d")`; components that draw
  (e.g. `OctoCountdownStrip`) would crash on the `null` return at render time. The stub installs once
  and marks the prototype (`__cxrCanvasStubbed`) so a real implementation is never clobbered.
- **`window.location` restoration.** A `beforeEach` puts back the original property descriptor if a
  previous test replaced it, so location-mutating tests cannot leak into their neighbours.

Anything beyond that is per-test: there is no global fetch mock, no auto-cleanup library, no
`@testing-library/react`.

### 2.2 Browser environment for E2E

Chromium launches with three load-bearing flags
([`playwright.config.ts`](../playwright.config.ts)):

| Flag                                         | Why                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--autoplay-policy=no-user-gesture-required` | Playback state must follow our taps, not Chrome's media-engagement heuristic on localhost.  |
| `--mute-audio`                               | Volume is asserted from `<video>.volume`, not heard; keeps CI runners silent.               |
| `--disable-dev-shm-usage`                    | Avoids intermittent silent renderer crashes (page closes, no error) when an ad slot mounts. |

Two projects run the same specs:

| Project         | Device                              | Selection         | Tests |
| --------------- | ----------------------------------- | ----------------- | ----: |
| `chromium`      | Desktop Chrome                      | everything        |    32 |
| `mobile-chrome` | Pixel 5 — touch, mobile UA, 393×851 | `grep: /@mobile/` |    18 |

Total **65 tests across 7 spec files** — one per ad layout, plus `publicApi` and `init`. The mobile project is not cosmetic:
the UA changes what `platform/device.ts` reports as `os_type`, the viewport changes the box around
the slot, and `hasTouch` makes `WidgetPage` dispatch real `touchscreen.tap` events rather than mouse
clicks. Tag a test `@mobile` when its layout ships to phones — L3 (320×50),
L4 (320×100), L5 (320×480), and the 320×100 stacked shape. The desktop-only formats (L1 300×600,
L2 300×250) and the unlisted-size case stay desktop-only.

---

## 3. Test types

| #   | Type                     | Tool               | Location                                  | Count               | Gate                  |
| --- | ------------------------ | ------------------ | ----------------------------------------- | ------------------- | --------------------- |
| 1   | Unit (pure logic)        | Vitest             | `src/**/*.test.ts`                        | part of 2256        | pre-push (coverage)   |
| 2   | Component / hook         | Vitest + jsdom     | `src/**/*.test.tsx`                       | part of 2256        | pre-push (coverage)   |
| 3   | Fixture contract         | Vitest             | `tests/unit/feedFixtures.test.ts`         | 19                  | pre-push              |
| 4   | Harness guard            | Vitest             | `tests/unit/mountWidgetOverrides.test.ts` | 6                   | pre-push              |
| 5   | Mock self-tests          | Vitest             | `tests/_mocks/*.test.ts`                  | 26                  | pre-push              |
| 6   | E2E — desktop            | Playwright         | `tests/e2e/*.spec.ts`                     | 25                  | CI (label-gated)      |
| 7   | E2E — mobile             | Playwright         | same specs, `@mobile` tag                 | 16                  | CI (label-gated)      |
| 8   | Ad resource budget (HAI) | Playwright scripts | `ad-resource-budget/`                     | 7 checks / 36 cells | manual                |
| 9   | Typecheck + lint         | tsc / eslint       | whole package                             | —                   | pre-push + `lint.yml` |

Totals as measured on 2026-08-15: **134 Vitest files / 2256 tests**, **65 Playwright tests / 7 files**. Per-gate wall times: [TESTING.md → Gate timings](TESTING.md#gate-timings-measured-2026-08-15).

**Not a test type here:** Storybook. `pnpm storybook` / `pnpm build-storybook` exist and
`@storybook/addon-vitest` is installed, but the package has one story file — it is a component
playground, not a coverage surface, and no gate runs it.

### 3.1 Unit and component tests (the bulk)

Colocated next to the source: `feature.ts` → `feature.test.ts`. Rendering uses **raw React** —
`createRoot` + `act` from `react-dom/client` — not `@testing-library/react`. The canonical shape
(from [`src/controls/buttons/atoms/MuteUnmuteButton.test.tsx`](../src/controls/buttons/atoms/MuteUnmuteButton.test.tsx)):

```tsx
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { MuteUnmuteButton } from "./MuteUnmuteButton";

vi.mock("@cxr/config", () => ({ assetLink: "https://test.cdn/" }));

describe("MuteUnmuteButton", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  it("renders mute icon when isMuted=true", () => {
    act(() => root.render(<MuteUnmuteButton isMuted onClick={() => undefined} />));
    expect(container.querySelector("img")!.src).toContain("mute.svg");
  });
});
```

Hook and context values are captured into a module variable through a small `Consumer` component
rather than a renderer helper. **Copy the nearest sibling test rather than inventing setup** — the
conventions are enforced socially, not by a lint rule.

### 3.2 Fixture contract test

[`tests/unit/feedFixtures.test.ts`](../tests/unit/feedFixtures.test.ts) walks **every committed
`*.feed.json`** — statically-served tags (`src/providers/static-tag`), debug-device feeds
(`src/providers/debug-device`), and the E2E fixtures (`tests/e2e/fixtures/raw`) — through the real
`normaliseFeed`, asserting each yields renderable slides with dense ids and a known `kind`.

Fixtures are JSON, so TypeScript cannot check them; this test is the only thing between a malformed
fixture and a blank widget in a live embed. It grows automatically — drop a new `.feed.json` into one
of those directories and it is covered on the next run.

### 3.3 Harness guard

[`tests/unit/mountWidgetOverrides.test.ts`](../tests/unit/mountWidgetOverrides.test.ts) unit-tests
`applyTagOverrides` from the **E2E harness**. It exists because L2-PRECEDENCE (the E2E coverage of the L2
Octo path) depends on that patch landing in the right place; a silent break would make the spec
assert against an unpatched tag without failing. Test code testing test code, on purpose.

### 3.4 Mock self-tests

Each shared double in `tests/_mocks/` ships a `.test.ts` sibling asserting it still behaves the way
hundreds of tests assume. A silently-drifted mock makes the suite pass against a fiction; these fail
loudly instead. Run them after upgrading any mocked dependency.

### 3.5 E2E

Six specs, one per ad layout. Each owns its layout's routing plus the strategies characteristic of
that layout:

| Spec                 | Layout                      | Also owns                                                                                 |
| -------------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| `l1.300x600.spec.ts` | L1 desktop full player      | `Unknown` (336×280), stacked 300×600, the `visibilityGate` family                         |
| `l2.300x250.spec.ts` | L2 full player + Octo       | `genAiEnabled`, dashboard `enable_ask_question`, `adsDisabled`                            |
| `l3.320x50.spec.ts`  | L3 compact bar, no player   | stacked 320×100, the mute **enticement**, `servedStatically`                              |
| `l4.320x100.spec.ts` | L4 banner + thumb player    | cross-slide latch, `initialVolume`, `mutePassback`, `feedLoopEnabled`, `suppressedEvents` |
| `l5.320x480.spec.ts` | L5 tall — renders L1's path | the live-GenAd integration guard                                                          |
| `init.spec.ts`       | —                           | bundle smoke — loader + hashed core in dist                                               |

The one non-obvious product rule they orbit is the **mute-icon enticement**: a unit loads genuinely
muted (`volume: 0`) but shows the sound-on glyph to entice a tap; the enticement ends only on an
audio action, never on play/pause/expand/swipe, and the latch is per widget instance so it survives
slide changes. It lives in `CompactControlBar`/`AdControlBar` — L3 and L4 only. Full detail plus the
strategy seam and the known gaps: the [E2E README](../tests/e2e/README.md).

### 3.6 Ad resource budget

[`ad-resource-budget/`](../ad-resource-budget/) loads the tag the way a publisher would and scores it
against **Chrome Heavy Ad Intervention** (4 MB transferred, 60 s total CPU, 15 s CPU in any 30 s
window — `error` severity) plus IAB targets (`warn`). Not a correctness test; a revenue test — HAI
unloads the ad frame outright on breach. It is the harness that proves the HLS buffer caps and
active-slide-only `startLoad` still do their job. `pnpm budget` is one cell; `pnpm budget:all` is the
36-cell matrix (3 tags × 3 sizes × direct/iframe × interacted/not).

---

## 4. Test flows

### 4.1 Unit test flow

```
pnpm test
  → Vitest reads vitest.config.ts  (jsdom env, @cxr alias, react plugin)
  → runs tests/_setup/vitest.setup.ts once per worker  (canvas stub, location guard)
  → collects: tests/unit/**, tests/_mocks/**, src/**/*.test.{ts,tsx}
     (tests/e2e/**, node_modules/**, dist/** excluded)
  → per test file: vi.mock() hoists module doubles
     → createRoot(container) → act(render) → assert DOM / captured context
     → act(unmount) in afterEach
  → (with --coverage) v8 collects, per-file thresholds evaluated, text + html emitted
```

### 4.2 E2E flow

```
pnpm build                       # dist/ must reflect current source — nothing rebuilds it for you
pnpm test:e2e
  → playwright.config.ts starts webServer: `serve dist -l 3111 --cors`
     (reuseExistingServer locally — see the port trap below)
  → per test:
     mountWidget(page, { tagId, size, query?, tagOverrides? })
       1. route /goservices/ad_creative/feed  → fixtures/raw/<tag>.feed.json  (matched FIRST)
       2. route /goservices/ad_creative       → fixtures/raw/<tag>.tag.json   (+ deep-merged overrides)
       3. route /goservices/data/ip_info      → fixed US record
       4. route **/e2e-harness*               → generated HTML with one .gen-ext of the given size
       5. page.goto('/e2e-harness', { waitUntil: 'domcontentloaded' })
          ── the real loader boots, opens a Shadow DOM, mounts React
          ── the REAL GenAd SDK loads from the CDN and runs the live waterfall
          ── the REAL Bunny-CDN .m3u8 plays
       6. waitUntil(… a slide layout to mount, 15s)  ← video-layout | ad-layout | compact-control-bar
     new CompactBar(page)  → shadow-piercing page object
       waitForPlayable() / waitForAdBar() / read() / tapMute() / tapPlay() / swipeNext() / waitForAdvance()
     expect(...)
  → reporter writes list (local) or github + html (CI); trace retained on failure
```

`goto` waits for `domcontentloaded`, not `load`, because `load` would block on third-party media and
ad subresources that can stall past the test timeout. The real readiness signal is the mount poll in
step 6.

### 4.3 Budget flow

```
pnpm build
pnpm budget:all
  → for each cell (tag × size × direct|iframe × interacted|not):
       serve dist + a publisher-style page → load the tag → observe ~31 s × 3 runs
       → record transferred bytes, CPU total, CPU peak window, request counts
  → score against budgets.json → write ad-budget-report.<variation>.<size>.<mode>.<state>.json
  → exit non-zero if a non-interacted cell breaches an `error` limit
```

---

## 5. Project structure

```
packages/contextual-reels/
├── src/
│   └── **/*.test.ts(x)              # Layer 1 — colocated with the source it covers
├── tests/
│   ├── _setup/
│   │   ├── vitest.setup.ts          # global Vitest setup (canvas stub, location guard)
│   │   └── react-dom-client.d.ts    # local type shim
│   ├── _mocks/                      # shared test doubles + their self-tests
│   │   ├── hlsMock.ts               # hls.js: startLoad/stopLoad/currentLevel, MANIFEST_PARSED
│   │   ├── vlitejsMock.ts           # vlitejs player
│   │   ├── genAdMock.ts             # window.GenAd: waterfall, completion, volume callbacks
│   │   ├── imaMock.ts               # Google IMA
│   │   ├── rudderstackMock.ts       # analytics sink
│   │   ├── axiosMock.ts             # HTTP
│   │   ├── genAiSdkMock.ts          # @genuin/genai-sdk
│   │   ├── windowEventMock.ts       # window event capture
│   │   └── *.test.ts                # one self-test per mock
│   ├── unit/
│   │   ├── feedFixtures.test.ts     # fixture drift guard (all committed *.feed.json)
│   │   └── mountWidgetOverrides.test.ts  # guards the E2E harness's applyTagOverrides
│   └── e2e/
│       ├── README.md                # layout map, strategy seam, gotchas, known gaps
│       ├── init.spec.ts             # bundle smoke
│       ├── l{1..5}.*.spec.ts        # 5 layout specs
│       ├── support/
│       │   ├── mountWidget.ts       # SIZE + TAG maps, API routing, harness page, strategy patch
│       │   ├── WidgetPage.ts        # shadow-DOM page object, every chrome (all taps + reads)
│       │   ├── shadow.ts            # installs window.__cxrRoot() — stacked-aware root lookup
│       │   ├── adRequests.ts        # opt-in ad-request observer (routes /tagxml/, continues)
│       │   ├── analytics.ts         # opt-in analytics recorder (stubs window.rudderanalytics)
│       │   ├── poll.ts              # waitUntil / pollUntil — the ONLY sanctioned wait
│       │   └── assertDistServer.ts  # globalSetup guard: dist present + port not the dev server
│       ├── fixtures/raw/            # verbatim captured QA responses (<tag>.tag.json / .feed.json)
│       └── legacy/                  # pre-Playwright .legacy.js — testIgnore'd, unmaintained
├── ad-resource-budget/              # HAI/IAB measurement harness (scripts, budgets, cxr wiring)
├── vitest.config.ts
├── playwright.config.ts
├── coverage/                        # generated — v8 html + text report
├── playwright-report/               # generated — HTML report
├── test-results/                    # generated — traces, screenshots, per-test artifacts
└── ad-budget-report.*.json          # generated — one per budget cell
```

### 5.1 The E2E page object

[`support/WidgetPage.ts`](../tests/e2e/support/WidgetPage.ts) is where most DOM knowledge lives. It
pierces the shadow root via `window.__cxrRoot()` (stacked-aware — a direct `.gen-ext.shadowRoot`
returns `null` under the stacked variant), identifies icons **by asset filename** (`unmute.svg` =
sound-on, `mute.svg` = real-muted) and corroborates with `<video>.volume`.

| Method                                             | Purpose                                                                    |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `read()` / `readVideoState()`                      | Snapshot of icons, active slide index, and video volume                    |
| `waitForPlayable()`                                | Block until the content video can actually play                            |
| `waitForAdBar()`                                   | Block until a **real** ad fill renders the control bar (20 s)              |
| `waitForAdvance(fromIndex)`                        | Block until the real ad completion advances the carousel (45 s)            |
| `waitForAdSlot()`                                  | Fill wait for the full-player layouts — `waitForAdBar` only works on L3/L4 |
| `feedIndex()`                                      | TRUE feed position (`data-cxr-active-index`); `activeSlideIndex()` is not  |
| `tapMute()` / `tapPlay()`                          | Real pointer clicks, then wait for the state change they should cause      |
| `muteIconAnywhere()` / `tapMuteAnywhere()`         | Work across every chrome — compact bar, default top bar, fullscreen rail   |
| `swipeNext()`                                      | Advance the carousel and return the arrived slide's state                  |
| `tapExpand()` / `tapCollapse()` / `isFullscreen()` | Fullscreen round trip                                                      |
| `describeDom()`                                    | Diagnostic dump used in failure messages                                   |

Timeouts are generous by design: the waits are on a real ad server and a real CDN.

---

## 6. Running the suites

```bash
# from packages/contextual-reels (or add `pnpm --filter @genuin/contextual-reels`)

pnpm test                 # 134 files / 2256 tests, single run
pnpm test:watch           # watch mode — the default dev loop
pnpm test:coverage        # same tests + v8 coverage + per-file thresholds (the real gate)
pnpm test -- src/feed     # a subset by path
pnpm test -- -t "L3-ROUTE" # a subset by test name

pnpm build && pnpm test:e2e                     # E2E — dist must be built FIRST
CXR_E2E_PORT=3131 pnpm test:e2e                 # only if something already owns 3111
npx playwright test --project=mobile-chrome     # phone formats only
npx playwright test tests/e2e/l3.320x50.spec.ts  # one layout
npx playwright test --headed --debug            # watch it drive the browser

pnpm typecheck            # tsc --noEmit (the only check covering type-only files)
pnpm lint                 # eslint src/  — note: does NOT cover tests/ (see §10)

pnpm budget               # one cell  (~96 s)
pnpm budget:all           # 36 cells  (~19 min)
```

### 6.1 Two setup traps that look like product bugs

1. **Port collision.** `webServer.reuseExistingServer` is on locally, so whatever already owns the
   E2E port gets reused — a dev server then serves an app shell instead of `dist/gen_ext.min.js` and
   every test times out waiting for a layout to mount. The suite moved from 3011 to **3111** on
   2026-08-14 because `pnpm dev` kept landing on 3011: Vite asks for 3010
   ([`vite.config.mjs`](../vite.config.mjs)) and drifts upward when it is taken. If something owns
   3111 too, run `CXR_E2E_PORT=3131 pnpm test:e2e`.
2. **Missing or stale `dist/`.** Playwright builds nothing. Without `pnpm build`, you are testing
   whatever was last built. (And note pnpm 8 does not run `pre`/`post` scripts, so `pnpm build` skips
   `prebuild` — on a fresh clone build via `pnpm turbo build --filter=@genuin/contextual-reels`,
   which builds the `@genuin/genai-sdk` dependency first.)

Both now fail fast. The `globalSetup` guard
[`support/assertDistServer.ts`](../tests/e2e/support/assertDistServer.ts) checks that
`dist/gen_ext.min.js` exists and that whatever already owns the port answers it with JavaScript, and
aborts in ~1 s naming the fix. Without it, either mistake surfaced as 41 identical ~15 s mount
timeouts — the failure mode that reads like a product break:

```
Error: Port 3111 is already serving something that is not the built bundle
       (GET /gen_ext.min.js → 200 text/html).
  Fix: stop it, or run on another port — CXR_E2E_PORT=3131 pnpm test:e2e
```

The guard is ordering-independent: a connection refusal means nothing is listening, which is the
healthy case — Playwright then starts its own `serve dist` on that port.

### 6.2 Measured times

| Command                                | Time                                                                 |
| -------------------------------------- | -------------------------------------------------------------------- |
| `pnpm typecheck`                       | ~3 s                                                                 |
| `pnpm lint`                            | ~5 s                                                                 |
| `pnpm test`                            | 13–18 s on the reference M3; **41 s** measured 2026-08-14 under load |
| `pnpm test:coverage`                   | 23 s (v8 is cheap here)                                              |
| `pnpm build`                           | 5 s (16 s warm via turbo)                                            |
| `pnpm test:e2e` (local, 4 workers)     | 68–81 s                                                              |
| `pnpm test:e2e` (`CI=true`, workers 1) | ~4.3 min                                                             |
| E2E on the CI runner, `--workers=2`    | ~192 s                                                               |
| `pnpm budget` / `budget:all`           | 96 s / ~19 min                                                       |

Wall time for unit tests moves with machine load and core count (Vitest is worker-parallel); E2E wall
time moves with the QA ad server and CDN. Treat both as bands. Full method and per-directory
breakdown: [TESTING.md](TESTING.md#measurement-method).

---

## 7. Where each check runs

| Check                     | Trigger                               | Where                                                   |
| ------------------------- | ------------------------------------- | ------------------------------------------------------- |
| Lint (repo-wide)          | every PR + push to master             | [`lint.yml`](../../../.github/workflows/lint.yml)       |
| Lint (this package)       | every `git push`                      | [`.husky/pre-push`](../../../.husky/pre-push)           |
| Typecheck                 | every `git push`                      | `.husky/pre-push` (root turbo step fans out here)       |
| **Unit + coverage gates** | every `git push`                      | `.husky/pre-push` → `pnpm --filter … test:coverage`     |
| **E2E (65 tests)**        | `workflow_dispatch`, or a labelled PR | [`e2e-cxr.yml`](../../../.github/workflows/e2e-cxr.yml) |
| Ad resource budget        | manual                                | your machine                                            |

`SKIP_CXR_CHECKS=1 git push` bypasses the CXR block in the pre-push hook. E2E and the budget matrix
are not in that hook on purpose: they need a built `dist/` and fire real QA ad requests, which would
make every push slow and cost real inventory.

### 7.1 GitHub Actions — `e2e-cxr.yml`

Opt-in, never automatic on every PR:

- **Triggers:** `workflow_dispatch`, or a PR carrying **both** the `run-e2e-all` and
  `pkg:contextual-reels` labels. `pkg:contextual-reels` is applied automatically by
  [`auto-label-pr.yml`](../../../.github/workflows/auto-label-pr.yml) when the diff touches
  `packages/contextual-reels/`; `run-e2e-all` is the human opt-in.
- **Concurrency:** one run per PR, `cancel-in-progress: true`. 20-minute job timeout.
- **Secrets:** `CXR_ENV_DEVELOPMENT` → `packages/contextual-reels/.env.development`, and `GEN_AI_ENV`
  → `packages/genai/.env.development`. The development build reads both through `env-cmd` and fails
  without them.
- **Install:** `pnpm install` with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` — the monorepo postinstall
  would otherwise pull all four engines; this job only needs Chromium.
- **Caches:** `~/.cache/ms-playwright` keyed on `pnpm-lock.yaml` (browser binary only — apt libs are
  not cacheable, so `install-deps` still runs on a hit), and `.turbo` for the local build cache.
- **Build:** `pnpm turbo build --filter=@genuin/contextual-reels`, never `pnpm --filter … build` (the
  `prebuild` trap above).
- **Run:** `test:e2e --workers=2` with `CI=true`. `playwright.config.ts` pins `workers: 1` under CI;
  the override is measured. **3 workers was tried and rejected** — 182 s vs 192 s (a 5% gain) while
  FP-1c failed outright in both projects, because video decode is genuinely CPU-bound and a 2-vCPU
  runner cannot absorb a third worker. Do not raise it without re-measuring on the runner; the
  4-worker figure in TESTING.md is from an 8-core laptop. Do not shard either: setup is paid per
  shard and billing doubles.
- **Artifacts:** `playwright-report/` uploaded with `if: always()` and `continue-on-error: true`, so
  an artifact-storage quota error cannot fail an otherwise-green job. 7-day retention.

Under CI, `retries: 2` and `trace: retain-on-failure` apply, so a flake surfaces as a retry with a
downloadable trace rather than a bare red X.

---

## 8. Dependencies

| Package                            | Version  | Role                                                    |
| ---------------------------------- | -------- | ------------------------------------------------------- |
| `vitest`                           | ^2.1.5   | Unit/component runner                                   |
| `@vitest/coverage-v8`              | ^2.1.5   | Coverage provider + threshold enforcement               |
| `jsdom`                            | ^25.0.1  | DOM for layer 1                                         |
| `@vitejs/plugin-react`             | ^4.3.3   | JSX transform for tests (and the build)                 |
| `@playwright/test`                 | ^1.49.0  | E2E runner, page objects, reporters, traces             |
| `serve`                            | ^14.2.1  | Static server for `dist/` during E2E                    |
| `msw` / `msw-storybook-addon`      | ^2.6.0   | Storybook-only request mocking (not used by the suites) |
| `typescript`                       | ^5.8.3   | `pnpm typecheck`                                        |
| `eslint` + `@genuin/eslint-config` | ^9.28.0  | `pnpm lint`                                             |
| `playwright-core`                  | vendored | Budget harness (`ad-resource-budget/scripts/`)          |

Notably **absent, on purpose**: `@testing-library/react` (raw `react-dom` instead — keeps tests
honest about what React actually does with `act`), and `@axe-core/playwright` (an accessibility scan
is a deferred decision — it needs a new dependency, which requires team approval per the root
`.claude/CLAUDE.md`, plus an owner for the findings).

Adding any new test dependency requires team approval.

---

## 9. Test data

### 9.1 Layer 1 — mocks

All shared doubles live in [`tests/_mocks/`](../tests/_mocks/) and are imported explicitly (there is
no auto-mock). Each exposes an installer plus capture helpers, e.g. `createHlsInstanceMock()` returns
recorded `startLoad`/`stopLoad`/`currentLevel` and lets a test deliver `MANIFEST_PARSED`
synchronously; `installGenAdMock()` fakes `window.GenAd` and can simulate the video→banner→native
waterfall, completion, and volume changes. Every mock has a self-test asserting it still matches the
real API shape.

### 9.2 Layer 2 — captured QA fixtures

`tests/e2e/fixtures/raw/<tagId>.{tag,feed}.json` are **verbatim** QA API responses — never
hand-authored. Six real tags, named by variation in `mountWidget.ts`:

| Name                             | Feed shape                | Path exercised          |
| -------------------------------- | ------------------------- | ----------------------- |
| `adOnly` / `adOnlyAlt`           | `type:"ads"` + `video_ad` | AdLayout / AdControlBar |
| `videoPlusAd` / `videoPlusAdAlt` | `loop` + `ad_config`      | VideoLayout + ad break  |
| `videoOnly` / `videoOnlyAlt`     | `loop`                    | plain VideoLayout       |

Refresh one with:

```bash
curl -H "x-user-id: e2e" "https://api.qa.begenuin.com/goservices/ad_creative?tag_id=<id>"       # → <id>.tag.json
curl -H "x-user-id: e2e" "https://api.qa.begenuin.com/goservices/ad_creative/feed?tag_id=<id>"  # → <id>.feed.json
```

Any new fixture is automatically picked up by the drift guard (§3.2).

### 9.3 Patching a fixture — `tagOverrides`

`mountWidget` deep-merges `tagOverrides` into the captured tag before serving it:

```ts
await mountWidget(page, {
  tagId: TAG.videoOnly,
  size: "L2",
  tagOverrides: { config: { enable_ask_question: true } },
});
```

**Use it only for BACKEND-shaped config no QA tag carries** (feature flags go through the `strategies` seam instead). Today that is exactly one case — L2-PRECEDENCE's
`enable_ask_question`, because every captured tag ships it `false` and the GenAI/Octo path is
unreachable from real inventory. Anything beyond a flag and the fixture stops representing
production, which defeats the point of replaying captured bodies. Each use should also mount the
un-patched tag so the assertion is the delta.

### 9.4 Sizes

`SIZE` in `mountWidget.ts` maps layout ids to slot dimensions: L1 `[300,600]`, L2 `[300,250]`,
L3 `[320,50]`, L4 `[320,100]`, L5 `[320,480]`. Pass an explicit `[w,h]` (e.g. `[336,280]`) to exercise
`AD_LAYOUT.Unknown`.

---

## 10. Reporting

| Output                        | Produced by                  | Where                                                               |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| Vitest console summary        | `pnpm test`                  | stdout                                                              |
| Coverage — text + HTML        | `pnpm test:coverage`         | stdout + [`coverage/`](../coverage/)                                |
| Playwright list reporter      | `pnpm test:e2e` (local)      | stdout                                                              |
| Playwright GitHub annotations | `CI=true`                    | inline on the PR                                                    |
| Playwright HTML report        | `CI=true` (`open: "never"`)  | `playwright-report/` → CI artifact `cxr-playwright-report` (7 days) |
| Traces / screenshots          | `trace: "retain-on-failure"` | `test-results/<test>/trace.zip`                                     |
| Budget scorecards             | `pnpm budget:all`            | `ad-budget-report.<variation>.<size>.<mode>.<state>.json`           |

Open a failed E2E run's trace with `npx playwright show-trace test-results/<dir>/trace.zip` — it
replays the DOM, network, and console for every step.

### 10.1 Coverage thresholds

Thresholds are **per-file** and only evaluated under `--coverage`
([`vitest.config.ts`](../vitest.config.ts)):

| Scope                                                                                                                                       | lines / branches / functions / statements |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Global                                                                                                                                      | 85 / 75 / 85 / 85                         |
| `src/utils/**`, `device/**`, `analytics/**`, `services/**`, `config/**`, `ads/**`, `player/**`, `feed/transforms/**`, `utils/thumbnails.ts` | **100 / 100 / 100 / 100**                 |
| `src/providers/**`                                                                                                                          | 95 / 90 / 95 / 95                         |

Excluded, each with a reason inline in the config: `loader.jsx` and `index.jsx` (browser-only
bootstrap — covered by E2E), `types.ts` and `*.d.ts` (no executable lines), `src/stories/**`
(Storybook-only MSW bootstrap), and `*.test.*` / `*.stories.*` themselves.

Current state: ~99.6% statements, ~97.4% branches, 100% functions.

> **The trap worth memorising: a failing test short-circuits the threshold check.** A red suite hides
> a coverage regression. Fix failures first, _then_ read the threshold report.

---

## 11. Best practices

**Writing tests**

1. **Test-first.** Red → green → refactor. A new source file with no test fails its directory's
   coverage gate, so the workflow is enforced mechanically.
2. **Colocate** unit/component tests with the source (`foo.ts` → `foo.test.ts`). `tests/` is for the
   harness and its guards, not for product tests.
3. **Copy the nearest sibling test** for setup. Raw `createRoot` + `act`, explicit `vitest` imports
   (`globals: false`), `@cxr/*` alias, mocks from `tests/_mocks/`.
4. **Reuse a mock rather than inlining a new fake** — and if you extend one, extend its self-test.
5. **Independent tests only.** No shared mutable state, no ordering assumptions. `afterEach` must
   unmount and clean the DOM.
6. **Select by `data-testid` or ARIA role**, never by CSS class or tag alone. Add a `data-testid` to
   any interactive element a test needs to reach.

**E2E specifically**

7. **Never `page.waitForFunction`.** Playwright polls it on `requestAnimationFrame`, and rAF stops
   being delivered for the slot once the widget mounts — a predicate that is false on first
   evaluation never re-runs _and_ its own timeout never fires, so the call hangs until the whole test
   times out and the failure surfaces on an unrelated line. Use `waitUntil` / `pollUntil` from
   [`support/poll.ts`](../tests/e2e/support/poll.ts), which are `evaluate`-driven with real
   deadlines. This one change cut the suite from ~4½ minutes of timeouts to ~45 s.
8. **No `page.waitForTimeout`** — a repo-wide rule. Every wait must be a bounded poll on a real
   condition.
9. **DOM access goes through `WidgetPage.ts` / `window.__cxrRoot()`.** Specs assert on state, not selectors.
10. **Tag `@mobile`** when the layout ships to phones (L3/L4/L5, stacked 320×100).
11. **Suspect a missing bounded wait before suspecting the product** when you see a new intermittent
    failure. Three races were fixed to reach a clean `--retries=0` run: an rAF-polling hang, a
    mid-transition carousel read in `waitForAdvance`, and an audible-start icon read before the SDK
    reported volume.
12. **A genuine no-fill is a real failure**, not a flake — the QA ad config is expected to fill.

**Before pushing**

13. Pre-push runs typecheck + lint + `test:coverage` automatically (~23 s for this package).
14. Touched the mount path, layouts, controls, or the ad integration? Run `pnpm build && pnpm test:e2e`
    locally, or push with the `run-e2e-all` label so `e2e-cxr.yml` runs it.
15. Touched media loading, ad requests, or bundle size? Run `pnpm budget:all` — nothing runs it for you.
16. **Do not run `pnpm format` on the package.** 77 files already fail `prettier --check`; a package
    format buries your change in unrelated diff noise. Format only the paths you touched:
    `npx prettier --write <file>`.

---

## 12. Known gaps

Deliberate, so nobody assumes otherwise. Rationale in the deferred table in the
[E2E README](../tests/e2e/README.md#deferred--future-work).

| Gap                                | Status                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Accessibility (axe) scan           | Deferred — needs a new dependency (team approval) **and** an owner for the findings                                         |
| Real touch events                  | Partial — `mobile-chrome` gives UA + viewport + `hasTouch`, but the page object still uses `page.mouse.click`               |
| Visual regression                  | Not recommended — real third-party creatives change per impression; snapshots would be permanently red                      |
| Unit tests in CI                   | Not wired — gated by `.husky/pre-push` only                                                                                 |
| Budget matrix in CI                | Not wired — manual; would need `--concurrency 2` so CPU contention doesn't produce false HAI breaches                       |
| `eslint` over `tests/`             | Open — no flat-config entry covers the directory, so it errors on undefined Playwright globals                              |
| SY-1 / NF-1 (system-mute, no-fill) | Not reproducible against a real always-filling ad; the latch logic is unit-covered                                          |
| AB-1 (mid-roll ad break)           | Open — the break triggers on a content position the short QA clip + headless playback never reaches; needs a longer QA clip |
| `tests/e2e/legacy/`                | Excluded via `testIgnore`; kept for reference, unmaintained                                                                 |

---

## 13. Onboarding path

1. Read §1–§3 here, then run `pnpm test` and watch it go green.
2. Open [`src/controls/buttons/atoms/MuteUnmuteButton.test.tsx`](../src/controls/buttons/atoms/MuteUnmuteButton.test.tsx)
   — the smallest complete example of the component convention.
3. Add a test to an existing file. Run `pnpm test:coverage` and read the threshold report.
4. Run `pnpm build && pnpm test:e2e --project=chromium tests/e2e/l3.320x50.spec.ts`. Watch a real ad
   fill. Then open the HTML report.
5. Read the [E2E README's](../tests/e2e/README.md) coverage matrix and the enticement state machine —
   the specs are unreadable without that product rule.
6. Skim [CONTRIBUTING.md](CONTRIBUTING.md) for the invariants and partner contracts you must not break.

When you learn something non-obvious about the harness, put it here or in
[TESTING.md](TESTING.md) — the next person's ramp-up is the point.
