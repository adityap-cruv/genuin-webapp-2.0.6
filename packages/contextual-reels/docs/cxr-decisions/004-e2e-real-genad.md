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
fully deterministic ad tests, but it tested CXR's control layer *around* a fake
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
- **AB-1 deferred.** The mid-roll ad break (`controls.video-plus-ad.spec.ts`,
  `test.fixme`) never reaches the visible "playing" state in the harness even
  with real GenAd — the break appears to trigger on a content-video position the
  short QA clip + headless playback doesn't reach. Needs trigger investigation.
- **Network coupling.** Ad/video tests now depend on the QA ad server + CDN
  being up and filling. `playwright.config.ts` keeps `retries: 2` in CI / `1`
  locally, and `--disable-dev-shm-usage` mitigates an intermittent silent
  Chromium renderer close while an ad slot mounts. Real runs are slower
  (~20s for the completion-driven XS-1b).
- **MU-2** (audible-start, `initialVolume>0`) has no QA tag among the fixtures
  and stays covered by `src/controls/CompactControlBar.test.tsx`.
- If determinism is later needed back (e.g. to restore SY-1/NF-1 or to decouple
  CI from the ad server), reintroduce an opt-in stub mode in `mountWidget`
  rather than reverting this decision wholesale.

See `tests/e2e/README.md` for the operational guide.
