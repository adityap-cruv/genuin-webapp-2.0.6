/**
 * L5 — 320×480 tall mobile unit, rendered on L1's full-player path.
 *
 * L5 is the layout most likely to be broken by a refactor, because it is the
 * one whose id and render path disagree: `resolveAdLayout` returns a distinct
 * `AD_LAYOUT.L5`, but the widget deliberately renders L1's full player for it.
 * Anything that branches on "is this a mobile size" rather than on the layout id
 * breaks here and nowhere else.
 *
 *
 *   L5-ROUTE       320×480 resolves to L5 but renders the FULL PLAYER
 *   L5-AD-ROUTE    an ads-only tag reaches AdLayout + a real filled GenAd slot
 *   L5-EXPAND      the expand round trip on the tall unit
 *
 * L5 ships to phones, so the whole file runs under `mobile-chrome` too.
 *
 * KNOWN GAP — the traffic experiment (`TAG_EXPERIMENTS`) has no E2E assertion,
 * because it has no observable effect to assert. Its only entry that this suite
 * can mount, `6a3aa8244da8cd92d289cc72`, overrides `gateOnUnmute` and
 * `mutePassback` — but that tag's feed is 6 `loop` reels with NO ads, so neither
 * override has anything to act on. (Worth raising with ad-ops: the experiment
 * may be a no-op in production for that tag.) The override logic itself is
 * unit-covered in `strategies.test.ts` via `applyExperiment`.
 *
 * The experiment is still handled here, structurally rather than by assertion:
 * `mountWidget` seeds the bucket roll to an out-of-bucket value by default, so
 * the ~10%-per-test coin flip that flaked the old suite cannot happen at all.
 *
 * KNOWN GAP — the fullscreen ad break (`adBreakEnabled`). `useFullscreenAdBreak`
 * and `PlayerProvider.isAdBreakActive` are live, but the break triggers at a
 * content-video position that the short QA clip plus headless playback never
 * reach, so it cannot be driven from this harness. Deliberately NOT stubbed as a
 * `test.fixme` — a skipped test reads as coverage that exists. It stays
 * unit-covered in `feed/hooks/useFullscreenAdBreak.test.ts`; restoring E2E
 * coverage needs a QA fixture with a longer clip. See ADR 004.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { WidgetPage } from "./support/WidgetPage";
import { mountWidget, TAG } from "./support/mountWidget";

/** Highest volume across the mounted videos — the active slide's audio. */
const volume = (page: Page) =>
  page.evaluate(() => {
    const root = window.__cxrRoot() as ShadowRoot;
    const videos = Array.from(root.querySelectorAll("video")) as HTMLVideoElement[];
    return Math.max(0, ...videos.map((v) => (v.muted ? 0 : v.volume)));
  });

test.describe("L5 — 320x480 tall unit", { tag: "@mobile" }, () => {
  // Asserted on the mounted DOM with no playback, so a failure means the size
  // did not resolve — not that the media or ad network misbehaved.
  test("L5-ROUTE: 320x480 resolves to L5 but renders the full-player layout", { tag: "@routing" }, async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L5" });

    const probe = await page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        slot: [host.offsetWidth, host.offsetHeight],
        adSizeMeta: document.querySelector('meta[name="ad.size"]')?.getAttribute("content"),
        // Present only on the L1/L5 full-player path.
        hasFullPlayer: !!root.querySelector('[data-testid="video-layout-player"]'),
        // L5 is a phone size but NOT a compact layout — this is the distinction
        // a size-based branch gets wrong.
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
      };
    });

    expect(probe.slot).toEqual([320, 480]);
    expect(probe.adSizeMeta).toBe("width=320,height=480");
    expect(probe.hasFullPlayer).toBe(true);
    expect(probe.hasCompactBar).toBe(false);
  });

  /**
   * The one test in the suite that keeps the REAL waterfall end to end.
   *
   * Everything else that asserts on ad requests observes them via
   * `captureAdRequests`, which passes through but still routes. This one runs
   * completely unintercepted, so the GenAd SDK loads from the CDN, the waterfall
   * runs against the live ad server and a genuine creative renders — the
   * integration ADR 004 exists to protect. A real no-fill is a real failure: the
   * QA ad config is expected to fill.
   */
  test("L5-AD-ROUTE: an ads-only tag reaches the ad layout with a real filled slot", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await mountWidget(page, { tagId: TAG.ads, size: "L5" });
    const widget = new WidgetPage(page);
    // The slot only mints its container once the SDK has an ad, so reaching this
    // means the waterfall genuinely filled. NOT `waitForAdBar`: that watches the
    // compact bar, which L5 never renders — it takes the full-player chrome.
    await widget.waitForAdSlot();

    const probe = await page.evaluate(() => {
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        hasAdLayout: !!root.querySelector('[data-testid="ad-layout"]'),
        hasGenAdSlot: !!root.querySelector('[id^="gen-ad-slot-"]'),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
      };
    });

    expect(probe.hasAdLayout).toBe(true);
    expect(probe.hasGenAdSlot).toBe(true);
    expect(probe.hasCompactBar).toBe(false);
    expect(pageErrors).toEqual([]);
  });

  // Same rule as L1: the banner chrome reports the real state, expanding is
  // itself an audio action, and the unmute survives the collapse. Re-asserted
  // here because L5 reaches it through a different layout id.
  test("L5-EXPAND: expanding unmutes for real and the unmute survives collapse", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L5" });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    expect(await widget.muteIconAnywhere()).toBe("mute.svg");
    expect(await volume(page)).toBe(0);

    expect(await widget.tapExpand()).toBe(true);
    expect(await widget.isFullscreen()).toBe(true);
    expect(await widget.muteIconAnywhere()).toBe("unmute.svg");
    expect(await volume(page)).toBeGreaterThan(0);

    expect(await widget.tapCollapse()).toBe(true);
    expect(await widget.isFullscreen()).toBe(false);
    expect(await widget.muteIconAnywhere()).toBe("unmute.svg");
    expect(await volume(page)).toBeGreaterThan(0);
  });
});
