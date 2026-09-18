# ADR 004 — Control-icon E2E runs against real GenAd, only the feed is mocked

**Status**: Accepted

## Context

The control-icon E2E suite (`tests/e2e/controls.*.spec.ts`) verifies the
play/pause and mute/unmute icon behavior that PR #339 fixed (the enticement
rule, cross-slide persistence, the audible-start mute tap). To assert that
behavior the suite has to drive a running widget through ad and video slides.

Three external dependencies make a naive run non-deterministic:

1. the tag config + feed API (`/goservices/ad_creative[/feed]`),
2. the GenAd SDK + its ad waterfall (live ad server), and
3. HLS content video.

The suite was first built with a **stubbed `window.GenAd`** so the waterfall
resolved on command (`fill` / `noFill` / `complete` / `systemMute`). That gave
fully deterministic ad tests, but it tested CXR's control layer _around_ a fake
ad — never the real SDK integration. The product owner asked for a genuine
end-to-end run, on the basis that the QA ad config is served by us and fills
reliably.

## Decision

Mock **only the feed**. Replay verbatim captured QA responses for the two API
endpoints (`fixtures/raw/<tag>.{tag,feed}.json`) so the feed shape and the
scenario variation (video-only / ad / video+ad) are pinned, and let everything
else run for real:

- the GenAd SDK loads from the CDN and runs its live waterfall — ad slots render
  a real creative with real mute/CTA wiring;
- the Bunny-CDN `.m3u8` content video plays for real (also what stops an unmute
  from tripping the autoplay-blocked → re-mute fallback).

Consequences for how tests are written:

- an ad slot's control bar appears on a **genuine fill** — tests
  `waitForAdBar()` instead of triggering a stub;
- ad feeds advance on **real ad completion** (≈15–30s) — tests `waitForAdvance()`;
- a real no-fill is treated as a **real failure** (the QA ad config is expected
  to fill).

The suite is served from the built `dist/` bundle, so `npm run build` must run
first and bakes `VITE_CXR_GEN_AD_BASE_URL` (currently `ad-sdk/1.0.0`) into the
loader.

## Consequences

- **Lost scenarios.** SY-1 (force a SYSTEM mute) and NF-1 (force a no-fill)
  cannot be reproduced against a real, always-filling ad and were removed. The
  one-way-latch logic SY-1 covered is still exercised by the Vitest unit tests.
- **AB-1 dropped from the suite (2026-08-13), and it is a real gap.** The interim
  fullscreen ad-break overlay (`useFullscreenAdBreak` +
  `PlayerProvider.isAdBreakActive`) **does exist on this branch**, but the break
  never reaches the visible "playing" state in the harness even with real GenAd —
  it appears to trigger on a content-video position the short QA clip plus headless
  playback never reaches. The permanently-skipped `test.fixme` was removed because
  it read as coverage that existed; the behaviour is covered at the unit level by
  `feed/hooks/useFullscreenAdBreak.test.ts` and `feed/layouts/VideoLayout.test.tsx`.
  Restoring end-to-end coverage needs a QA fixture with a clip long enough to reach
  the trigger position. (Note: on `feature/preview-bcc` this overlay was deleted
  outright in `13fa0fa3d`, so there the scenario belongs to the real VMAP player's
  test plan instead — do not carry that framing back here.)
- **Fixture patching, narrowly.** `mountWidget`'s `tagOverrides` deep-merges into
  a captured tag body, used by exactly one spec (SZ-9) to switch on
  `config.enable_ask_question` — the dashboard flag `StrategyProvider` turns into
  `genAiEnabled`, which no QA tag carries, so the L2 Octo path is otherwise
  unreachable end to end. Keep it to config flags real inventory cannot produce;
  anything else and the fixture stops representing production.
- **Network coupling.** Ad/video tests now depend on the QA ad server + CDN
  being up and filling. `playwright.config.ts` keeps `retries: 2` in CI / `1`
  locally, and `--disable-dev-shm-usage` mitigates an intermittent silent
  Chromium renderer close while an ad slot mounts. Real runs are slower
  (~20s for the completion-driven XS-1b).
- **MU-2 now has live coverage (2026-08-12).** The ads-only QA tag
  (`6a3aa78ba0daccfd439648b8`) since gained `initialVolume: 0.2` in
  `strategies/strategyConfig.ts`, so it loads genuinely unmuted and MU-1b asserts
  the audible-start cycle end to end. `src/controls/CompactControlBar.test.tsx`
  still covers it at the unit level.
- If determinism is later needed back (e.g. to restore SY-1/NF-1 or to decouple
  CI from the ad server), reintroduce an opt-in stub mode in `mountWidget`
  rather than reverting this decision wholesale.

See `tests/e2e/README.md` for the operational guide.

---

## Amendment (2026-08-15) — observation is allowed; stubbing still is not

The suite was rebuilt around the five ad layouts (`tests/e2e/l{1..5}.*.spec.ts`,
replacing `controls.*.spec.ts`). That surfaced a class of assertion this ADR did
not anticipate: several strategies are decisions about **whether or when an ad
request fires** (`adsDisabled`, and the request-shape of a `servedStatically`
tag). None are observable in the DOM — "no ad rendered" looks identical whether
the request was suppressed or was made and no-filled.

**Amendment.** A spec may OBSERVE ad-server traffic via
`tests/e2e/support/adRequests.ts`, which routes `nxs.begenuin.com/tagxml/` and
calls `route.continue()`. The real waterfall still runs and still fills; the spec
only learns the count. Scoped to `/tagxml/` deliberately — the same host serves
the post-fill VAST beacons (`/event/won`, `/event/impression`, per-quartile), and
counting those turns one requested ad into seven.

This does **not** relax the rule: no canned VAST, no stubbed `window.GenAd`, no
aborted requests. `l5.320x480.spec.ts` keeps one fully unintercepted path
(`L5-AD-ROUTE`) as the live-integration guard this ADR exists for.

**Analytics is now stubbed, and that is a net improvement.**
`tests/e2e/support/analytics.ts` pre-installs `window.rudderanalytics`;
`initRudderstack` is idempotent and no-ops when it finds one, so the real SDK
never loads. Reasons, in order: (a) Rudderstack flushes via
`navigator.sendBeacon`, which does not route reliably — an HTTP interceptor saw
exactly zero events; (b) it removes a CDN dependency; (c) **E2E runs no longer
emit real events into production analytics**, which they previously did on every
run. The stub's `ready(cb)` must invoke its callback — `AnalyticsProvider` arms
the buffer's emitter inside it.

**Captured fixtures now get a `visit_id` injected.** `createFeedGenerator` reads
`data.visit_id` and only then satisfies one of the two keys
`RudderstackEventBuffer` requires before flushing (the other is `geoip`). The
captured QA bodies omit it, so every event sat in `buffering` forever and
analytics was not observable from this suite at all. A real `/feed` response
always carries one, so injecting it makes the replay more faithful, not less.

**Gaps this rebuild closed, and the ones it did not.** `tagOverrides` is still
config-flags-only, but feature flags now go through the localhost-gated strategy
seam (`src/strategies/testOverrides.ts`) instead — see `tests/e2e/README.md`.
Still blocked by the same missing long-clip QA fixture as AB-1: `gateOnUnmute`
(only reaches the ad-break object on organic video reels) and `singleHitWaterfall`
(its contract is passback deferral, which needs a genuine no-fill — the same
blocker as SY-1 / NF-1).
