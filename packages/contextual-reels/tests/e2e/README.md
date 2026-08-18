# Contextual-reels E2E

Playwright end-to-end tests, organised **one spec per ad layout**. Each spec owns
its layout's rendering/routing plus the strategy behaviours characteristic of
that layout.

**65 tests in 7 files** — 39 under `chromium`, 18 under `mobile-chrome`, 8 under `webkit`.

```
pnpm build && pnpm test:e2e                     # dist must be built first
CXR_E2E_PORT=3131 pnpm test:e2e                 # only if something already owns 3111
npx playwright test --project=mobile-chrome     # phone formats only
npx playwright test tests/e2e/l3.320x50.spec.ts # one layout
```

## Layout map

| Spec                 | Layout                      | Routing + strategies it owns                                                                          |
| -------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `l1.300x600.spec.ts` | L1 desktop full player      | + `Unknown` (336×280) and stacked 300×600 · `visibilityGate`, `unit_hidden` passback, `destroyOnHide` |
| `l2.300x250.spec.ts` | L2 full player + Octo       | `genAiEnabled`, dashboard `enable_ask_question`, `adsDisabled`                                        |
| `l3.320x50.spec.ts`  | L3 compact bar, no player   | + stacked 320×100 · the mute **enticement**, `servedStatically`, ad-request baseline                  |
| `l4.320x100.spec.ts` | L4 banner + thumb player    | enticement cross-slide latch, `initialVolume`, `mutePassback`, `feedLoopEnabled`, `suppressedEvents`  |
| `l5.320x480.spec.ts` | L5 tall — renders L1's path | the live-GenAd integration guard                                                                      |
| `publicApi.spec.ts`  | —                           | the host-facing partner contract against the built bundle                                             |
| `init.spec.ts`       | —                           | bundle smoke (pre-existing)                                                                           |

Every `AD_LAYOUT` is covered, including `Unknown` and both stacked shapes.

### Projects

| Project         | Device         | Runs                        |
| --------------- | -------------- | --------------------------- |
| `chromium`      | Desktop Chrome | everything (39)             |
| `mobile-chrome` | Pixel 5        | tests tagged `@mobile` (18) |
| `webkit`        | Desktop Safari | tests tagged `@routing` (8) |

**Tag a test `@routing`** when it reads the mounted DOM without needing media
playback or an ad fill — layout resolution, the stacked split, bundle bootstrap.
Those are the assertions whose WebKit result is a real signal rather than a
retelling of Safari's autoplay policy, and they cost no ad inventory. WebKit is
the widget's only non-Chromium coverage; widening it to the audio specs is
worthwhile, but expect genuine differences there and treat them as findings.

**Tag a test `@mobile` when its layout ships to phones** — L3, L4, L5 and the
320×100 stacked shape. L1/L2 and the unlisted-size case stay desktop-only.
Per-file: on the `test.describe`. Per-test: `test("…", { tag: "@mobile" }, …)`.

The mobile project is not just a viewport: the UA changes what `platform/device.ts`
reports as `os_type`, and `hasTouch` makes `WidgetPage` dispatch real
`touchscreen.tap` instead of `mouse.click`.

## The one behavioural rule to know: the mute enticement

> A unit loads unmuted-but-silent (`volume: 0`, so it **is** muted). The icon
> nonetheless shows the **sound-on** glyph (`unmute.svg`) to entice a tap. The
> enticement ends **only on an audio action** — never on play/pause, expand or
> swipe. Once ended the icon tracks the **real** mute state forever, and the
> latch is per-widget-instance, so it survives a slide change.

`unmute.svg` = sound-on (enticement _or_ real-unmuted); `mute.svg` = real-muted.
Specs disambiguate by also reading `<video>.volume`.

The latch lives in `CompactControlBar` / `AdControlBar` — **L3 and L4 only**. The
banner chrome (L1/L2/L5) reports the real state, so it shows `mute.svg` on a
silent load. `l3` covers what ends the enticement; `l4` covers that it persists
across a slide change.

## Driving strategies: the test seam

Strategy flags are compile-time config (`strategyConfig.ts`), so combinations no
real tag carries were previously unreachable. `mountWidget`'s `strategies` option
serialises a patch into a `cxr_strategies` URL param, read by
[`src/strategies/testOverrides.ts`](../../src/strategies/testOverrides.ts) as the
**last** step of the cascade:

```
DEFAULT → preset → brand → tag inline → experiment → GIV → dashboard → TEST PATCH
```

```ts
await mountWidget(page, {
  tagId: TAG.video,
  size: "L1",
  strategies: { visibilityGate: true, visibilityGateTimeoutMs: 2000 },
});
```

Gated on `isLocalhost()`, so it is inert on any real host. Deliberately a runtime
**host** check and not `import.meta.env.DEV`: this suite runs the production
`vite build` output from `dist/`, where `DEV` folds to `false`.

Because the patch is last, it beats the dashboard flag too — so it **cannot**
express "the dashboard wins over the allowlist". That ordering is unit-covered in
`src/strategies/StrategyProvider.test.tsx`.

`suppressedEvents` is the one strategy that does not flow through
`StrategyProvider` (its consumer, `AnalyticsProvider`, sits deliberately ABOVE it
in the tree), so `getSuppressedEvents` is routed through the same seam.

### Pin the experiment bucket

`TAG_EXPERIMENTS` re-rolls per page load and each Playwright test gets a fresh
context, so a sampled tag silently flips config on ~10% of runs — this was a live
flake source in the previous suite. `mountWidget` seeds
`sessionStorage["cxr:exp-roll:<tagId>"]` to `0.999` (out of every bucket) by
default. Pass `experimentRoll` to choose an arm deliberately.

## What is real vs mocked

| Layer                                                | Status                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| Tag config + feed (`/goservices/ad_creative[/feed]`) | **Mocked** — verbatim QA responses from `fixtures/raw/`         |
| `ip_info`                                            | Mocked (a fixed US record) — still fires for static tags        |
| GenAd SDK + ad waterfall                             | **Real** — loads from the CDN, fills against the live ad server |
| Content video (Bunny CDN `.m3u8`)                    | **Real** — plays for genuine playback state                     |
| Rudderstack                                          | **Stubbed** — see below                                         |

Rationale and the 2026-08-15 amendment: [ADR 004](../../docs/cxr-decisions/004-e2e-real-genad.md).

A spec may **observe** ad requests via `support/adRequests.ts` (routes
`nxs.begenuin.com/tagxml/`, then `route.continue()` — the waterfall still runs).
Scoped to `/tagxml/` because the same host serves post-fill VAST beacons.
`l5`'s `L5-AD-ROUTE` stays fully unintercepted as the live-integration guard.

Analytics is stubbed by `support/analytics.ts`, which pre-installs
`window.rudderanalytics` (`initRudderstack` no-ops when it finds one). Rudderstack
flushes via `sendBeacon`, which does not route reliably; stubbing also means **E2E
runs no longer emit real events into production analytics**.

## The partner contract (`publicApi.spec.ts`)

`CLAUDE.md` marks `window.cxr`, the `cxr:*` postMessage protocol and the
`window.adFillCallback` / `noAdsCallback` globals as "never change without
approval". `index.jsx` wires all of it and is excluded from unit coverage on the
grounds E2E covers it — which was not true: E2E asserted only that the bundle
responded 200. This spec closes that, against the real built bundle:
`window.cxr`'s shape, the per-instance `ready` emit, DOM-id alias resolution
through `expand`/`collapse`, the postMessage bridge (including malformed frames),
multi-slot instancing, node-removal teardown, and a real fill reaching
`adFillCallback`.

`support/publicApi.ts` captures it. Two things make that non-trivial and are
worth knowing before extending it: `window.cxr` does not exist at navigation
time (it is assigned during module evaluation, and `on()` has no replay buffer),
so the helper installs a property accessor that subscribes at assignment; and the
partner callbacks are host-supplied, so the harness defines them pre-load exactly
as a publisher would.

**There is no rescan for late-injected slots.** `init()` runs once at module
evaluation; the `MutationObserver` in `index.jsx` is a per-instance _teardown_
watcher that unmounts when its node leaves the DOM. `PA-TEARDOWN` pins both
halves, so an SPA/lazy-container integration is not planned around an auto-mount
that does not exist.

## Fixture drift

`pnpm fixtures:check` diffs the committed captures against live QA by **shape**,
not values. It gates only on `LOAD_BEARING` keys the bundle actually reads;
everything else prints as a notice, because the backend churns presentational
fields and a permanently-red report is one nobody reads. **Manual** — ~5 s,
read-only, no ad requests. Worth running whenever you refresh a fixture or see an
unexplained E2E behaviour change.

It exists because the captures silently lacked `visit_id`. See Fixtures below.

## Harness (`support/`)

- **`mountWidget.ts`** — serves a harness page hosting one `.gen-ext`, replays the
  captured API responses, and returns a handle with `apiCalls` counts. Options:
  `strategies`, `experimentRoll`, `tagOverrides`, `query`, `offscreen` (renders
  below a 200vh spacer, for `visibilityGate`), `awaitMount: "none"` (for a unit
  that never mounts a layout).
- **`WidgetPage.ts`** — shadow-DOM-piercing page object for every chrome.
  `read`/`tapPlay`/`tapMute` are compact-bar scoped; the `*Anywhere` methods and
  the fullscreen helpers work anywhere. `feedIndex()` is the TRUE feed position.
- **`adRequests.ts`** / **`analytics.ts`** — opt-in observers. Both must be called
  **before** `mountWidget`.
- **`shadow.ts`** — installs `window.__cxrRoot()` / `__cxrHost()`. Use these, never
  `.gen-ext.shadowRoot` — under the stacked variant the root moves onto the
  `stacked-top` row and the direct lookup returns `null`.
- **`publicApi.ts`** — captures `window.cxr` events + the host partner callbacks.
  Must be called **before** `mountWidget`.
- **`poll.ts`** — `waitUntil` / `pollUntil`.

`mountWidget`'s `slotCount` renders more than one `.gen-ext`, for the multi-embed
path (`index.jsx` mints one instance per node).

## Gotchas that look like product bugs

**Never use `page.waitForFunction`.** Playwright polls it on
`requestAnimationFrame`, and once the widget is mounted rAF callbacks stop being
delivered for the slot. A predicate that is false on its first evaluation then
never re-runs _and_ its own `timeout` never fires, so the call hangs until the
whole test times out and the failure surfaces on an unrelated line. Use
`waitUntil`/`pollUntil` from `support/poll.ts`.

**`activeSlideIndex()` is not the feed position.** `computeSlideMountWindow`
mounts only the active slide plus a neighbour, so it never exceeds 1 however far
the feed has walked. Use `feedIndex()` (`data-cxr-active-index`).

**Analytics event fields live under `properties.event_details`**, not on
`properties` — `CapturedEvent.details` exposes them. An assertion written against
`properties.passback_reason` silently reads `undefined`.

**`waitForAdBar()` only works on L3/L4.** It watches the compact bar, which the
full-player layouts never render. Use `waitForAdSlot()` there.

**Port 3111.** `webServer.reuseExistingServer` is on locally, so a dev server
owning the port would be handed to the suite and serve an app shell instead of
`dist/gen_ext.min.js`. The suite used to default to 3011, which `pnpm dev` lands
on regularly (Vite asks for 3010 and drifts upward). `CXR_E2E_PORT` overrides, and
the `globalSetup` guard [`support/assertDistServer.ts`](support/assertDistServer.ts)
fails in ~1s on a hijacked port or a missing `dist/` instead of 50 identical 15s
mount timeouts.

## Fixtures

`fixtures/raw/<tagId>.{tag,feed}.json` are verbatim QA responses. `mountWidget`
injects a `visit_id` into the feed body when the capture lacks one — a real
`/feed` always carries it, and `RudderstackEventBuffer` will not flush without it.

The `TAG` map names each by what it actually is; its resolved `strategyConfig`
entry is documented inline there, because that is what a spec is really choosing
between. `TAG.ads` and `TAG.video` are deliberately **not** in `TAG_STRATEGIES`,
giving an all-off baseline so a strategy patch moves exactly one thing (at the
cost of a one-shot `unknown tag …` warn).

⚠️ **Never point a real ad request at the 15 live Infolinks production tags** (see
the warning block in `strategyConfig.ts`) — a single request inflates the real
tag's analytics. Offline fixtures for those ids are fine.

To refresh a fixture:
`curl -H "x-user-id: e2e" "https://api.qa.begenuin.com/goservices/ad_creative?tag_id=<id>"`
(and `…/ad_creative/feed?tag_id=<id>`).

## Known gaps

Each says what it needs. None are stubbed as `test.fixme` — a skipped test reads
as coverage that exists.

| Gap                          | Why it is not covered                                                                                                                                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AB-1** fullscreen ad break | `useFullscreenAdBreak` is live, but the break triggers at a content position the short QA clip + headless playback never reach. Needs a longer-clip QA fixture. Unit-covered.                                                           |
| **`gateOnUnmute`**           | Two compounding reasons: it never reaches a standalone `type:"ads"` slide (`feedTransforms.ts` forwards it only into the ad-break object on organic video reels), and on the video path it needs AB-1. Measured: 0 requests either way. |
| **`singleHitWaterfall`**     | Its contract is passback **deferral** (`AdProvider.onAdFail`), not request suppression — measured, a looped-back slot does re-request with the flag on. Observing the deferral needs a genuine no-fill.                                 |
| **`TAG_EXPERIMENTS`**        | Its only mountable entry (`6a3aa8244da8cd92d289cc72`) overrides `gateOnUnmute` + `mutePassback`, but that tag's feed is 6 `loop` reels with **no ads** — neither override has anything to act on. Worth raising with ad-ops.            |
| **SY-1 / NF-1**              | System-mute / no-fill — impossible against a real always-filling ad. [ADR 004](../../docs/cxr-decisions/004-e2e-real-genad.md).                                                                                                         |
| **Visual regression**        | Not recommended — real third-party creatives change per impression, so snapshots would be permanently red.                                                                                                                              |
| **Accessibility (axe)**      | Still open. `@axe-core/playwright` is a new dependency (team approval) **and** needs a named owner — without one the job goes permanently red, which is worse than no job.                                                              |

## CI

[`e2e-cxr.yml`](../../../../.github/workflows/e2e-cxr.yml) runs the full suite on
`workflow_dispatch` or a PR labelled **both** `run-e2e-all` and
`pkg:contextual-reels` (`auto-label-pr.yml` adds the second automatically).
Running on _every_ PR stays deliberate: each run fires real QA ad requests, which
is an ad-ops call. Job details: [docs/TESTING.md](../../docs/TESTING.md#what-the-ci-job-does).
