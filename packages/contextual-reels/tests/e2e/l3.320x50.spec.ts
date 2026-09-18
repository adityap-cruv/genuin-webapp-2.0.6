/**
 * L3 — 320×50 compact bar, no player, audio-only ads.
 *
 * The 50px bar has no room for a video, so L3 is the audio-only revenue path
 * (`AdProvider.isAudioOnlyAds`, the `320x50` AdControlBar variant). That makes
 * it the right home for the ad-REQUEST assertions: on a unit with no video, the
 * request IS the product.
 *
 * It also owns the `servedStatically` path (the live 320×50 inventory is served
 * that way) and the stacked 320×100 variant, whose top row is our L3.
 *
 *   L3-ROUTE          320×50 → compact bar, no player node
 *   L3-AD-ROUTE       an ads-only tag reaches AdLayout on the compact bar
 *   L3-ENTICEMENT     the sound-on enticement, and what does / does not end it
 *   L3-AD-REQUEST     an ads-only slot fires exactly one waterfall request on load
 *   L3-STATIC         a servedStatically tag makes zero tag/feed calls
 *   L3-STACKED        320×100 stacked puts our L3 on the top row
 *
 * L3 ships to phones, so the whole file runs under `mobile-chrome` too.
 *
 * KNOWN GAP — `singleHitWaterfall` has no E2E assertion. Its contract is NOT
 * "only one ad request per page load": `AdProvider.onAdFail` shows it only
 * DEFERS the no-fill passback until every slot has failed (`firePassbackIfExhausted`).
 * It does not gate requests at all — measured here, a looped-back second slot
 * issues a second `/tagxml/` request with the flag ON. Observing the deferral
 * needs a genuine NO-FILL, which the QA ad config never produces — the same
 * blocker as the SY-1 / NF-1 gaps in ADR 004. Unit-covered in
 * `providers/AdProvider.test.tsx`.
 *
 * (The `feedLoopEnabled` doc in `strategies.ts` used to claim single-hit
 * prevented a looped-back re-request. It does not; that comment is now fixed.)
 *
 * KNOWN GAP — `gateOnUnmute` is not reachable from this harness, for two
 * compounding reasons found while writing these specs:
 *
 *  1. It never reaches a standalone `type: "ads"` slide. In `feedTransforms.ts`
 *     the tag-level value is only forwarded into `buildReelAdObject` /
 *     `buildReelAdObjectFromConfig` — i.e. the AD-BREAK object on an ORGANIC
 *     VIDEO reel. An ads-only feed requests regardless of the flag. (The doc
 *     comment on `Strategies.gateOnUnmute` reads more broadly than the wiring.)
 *  2. On the video path it therefore needs `adBreakEnabled`, and the ad break
 *     never fires here — it triggers at a content position the short QA clip
 *     plus headless playback never reach. Same blocker as AB-1.
 *
 * Measured, not assumed: with `adBreakEnabled: true` and either value of
 * `gateOnUnmute`, ZERO waterfall requests fire within 8s. Unblocking it needs
 * the same longer-clip QA fixture AB-1 needs. Unit-covered meanwhile in
 * `feed/feedTransforms.test.ts`.
 */
import { test, expect } from "@playwright/test";

import { WidgetPage } from "./support/WidgetPage";
import { captureAdRequests } from "./support/adRequests";
import { mountWidget, TAG } from "./support/mountWidget";

test.describe("L3 — 320x50 compact bar", { tag: "@mobile" }, () => {
  test("L3-ROUTE: 320x50 resolves to the compact bar with no player", { tag: "@routing" }, async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L3" });

    const probe = await page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        slot: [host.offsetWidth, host.offsetHeight],
        adSizeMeta: document.querySelector('meta[name="ad.size"]')?.getAttribute("content"),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
        // The 50px bar has no room for a player, so it never mounts one.
        hasFullPlayer: !!root.querySelector('[data-testid="video-layout-player"]'),
      };
    });

    expect(probe.slot).toEqual([320, 50]);
    expect(probe.adSizeMeta).toBe("width=320,height=50");
    expect(probe.hasCompactBar).toBe(true);
    expect(probe.hasFullPlayer).toBe(false);
  });

  test("L3-AD-ROUTE: an ads-only tag reaches the ad layout on the compact bar", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await mountWidget(page, { tagId: TAG.ads, size: "L3" });
    const widget = new WidgetPage(page);
    await widget.waitForAdBar();

    const probe = await page.evaluate(() => {
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        hasAdLayout: !!root.querySelector('[data-testid="ad-layout"]'),
        // GenAdSlot mints `gen-ad-slot-<instance>-<adId>` per slot.
        hasGenAdSlot: !!root.querySelector('[id^="gen-ad-slot-"]'),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
        hasFullPlayer: !!root.querySelector('[data-testid="video-layout-player"]'),
      };
    });

    expect(probe.hasAdLayout).toBe(true);
    expect(probe.hasGenAdSlot).toBe(true);
    expect(probe.hasCompactBar).toBe(true);
    expect(probe.hasFullPlayer).toBe(false);
    // The bar's mute control still drives the real ad audio.
    expect(await widget.tapMuteAnywhere()).toBe(true);
    expect(pageErrors).toEqual([]);
  });

  /**
   * The mute-icon enticement — the one behavioural rule that survived the
   * rewrite, and the only one that is genuinely non-obvious:
   *
   *   A unit loads unmuted-but-silent (`volume: 0`, so it IS muted). The icon
   *   nonetheless shows the sound-on glyph (`unmute.svg`) to entice a tap. The
   *   enticement ends ONLY on an audio action — never on play/pause, expand or
   *   swipe. After that the icon tracks the real state forever.
   *
   * The latch lives in CompactControlBar / AdControlBar, i.e. L3 and L4 only.
   * L4 covers its cross-slide persistence; here we cover what ends it.
   */
  test("L3-ENTICEMENT: only an audio action ends the sound-on enticement", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L3" });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    // Loads silent, but shows sound-on to entice.
    expect(await widget.muteIconAnywhere()).toBe("unmute.svg");

    // A non-audio interaction must leave it alone.
    expect(await widget.tapPlayAnywhere()).toBe(true);
    expect(await widget.muteIconAnywhere()).toBe("unmute.svg");

    // First mute tap is the audio action: it UNMUTES (icon stays sound-on,
    // because now it is genuinely unmuted) and ends the enticement.
    expect(await widget.tapMuteAnywhere()).toBe(true);
    expect(await widget.muteIconAnywhere()).toBe("unmute.svg");

    // From here the icon tracks the real state: the next tap mutes.
    await widget.tapMuteAnywhere();
    expect(await widget.muteIconAnywhere()).toBe("mute.svg");
    await widget.tapMuteAnywhere();
    expect(await widget.muteIconAnywhere()).toBe("unmute.svg");
  });

  // The revenue path's baseline: a standalone ads slide requests its waterfall
  // as soon as it mounts, with no user gesture. This is the assertion the
  // `gateOnUnmute` tests were reaching for — see the KNOWN GAP above for why the
  // gated half of it cannot be driven from this harness.
  test("L3-AD-REQUEST: an ads-only slot fires exactly one request on load", async ({ page }) => {
    const ads = await captureAdRequests(page);

    await mountWidget(page, { tagId: TAG.ads, size: "L3" });

    // Exactly one, and it settles there — not a slot that re-requests per render.
    await ads.waitForCount(1);
  });

  // `servedStatically` reads tag config + feed from committed fixtures and skips
  // both API calls — but NOT `/ip_info`, which still supplies geoip for analytics
  // and the real client IP for the ad-URL rewrite. That asymmetry is the whole
  // point of the flag and the easiest thing to regress.
  test("L3-STATIC: a servedStatically tag skips tag+feed but still calls ip_info", async ({ page }) => {
    const mount = await mountWidget(page, { tagId: TAG.adsStatic, size: "L3" });
    const widget = new WidgetPage(page);
    await widget.waitForAdBar();

    expect(mount.apiCalls.tag).toBe(0);
    expect(mount.apiCalls.feed).toBe(0);
    expect(mount.apiCalls.ipInfo).toBeGreaterThan(0);

    // The fixture still produced a real, filled ad slot.
    const hasSlot = await page.evaluate(() => !!window.__cxrRoot()?.querySelector('[id^="gen-ad-slot-"]'));
    expect(hasSlot).toBe(true);
  });

  test("L3-STATIC: a non-static tag at the same size does call the API", async ({ page }) => {
    // The delta that makes the assertion above mean something: without it, a
    // broken interceptor would read as "static" for every tag.
    const mount = await mountWidget(page, { tagId: TAG.ads, size: "L3" });

    expect(mount.apiCalls.tag).toBeGreaterThan(0);
    expect(mount.apiCalls.feed).toBeGreaterThan(0);
  });

  // The ad URL is rewritten client-side for a static tag: real `navigator.userAgent`
  // for `ua`, and the `ip` macro replaced with the real client IP from geoip.
  test("L3-STATIC: the rewritten ad URL carries the real UA and client IP", async ({ page }) => {
    const ads = await captureAdRequests(page);

    await mountWidget(page, { tagId: TAG.adsStatic, size: "L3" });
    await ads.waitForCount(1);

    const realUa = await page.evaluate(() => navigator.userAgent);
    expect(ads.param("ua")).toBe(realUa);
    // `/ip_info` is stubbed to 0.0.0.0, so that is the IP that must land here —
    // proving the macro was resolved from geoip rather than left as `[IP]`.
    expect(ads.param("ip")).toBe("0.0.0.0");
  });

  // Stacked 320×100: the slot splits and our L3 compact bar takes the top row,
  // with an Infolinks in-place unit below.
  test("L3-STACKED: a 320x100 slot puts our L3 bar on the stacked top row", { tag: "@routing" }, async ({ page }) => {
    // Third-party Infolinks outage surfaces as `Unexpected token '<'`; theirs,
    // not ours. Anything else still fails.
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      const message = String(error);
      if (!message.includes("Unexpected token '<'")) pageErrors.push(message);
    });

    await mountWidget(page, { tagId: TAG.video, size: "L4", query: "gen_variant=stacked" });

    const probe = await page.evaluate(() => {
      const host = document.querySelector(".gen-ext") as HTMLElement;
      const top = host.querySelector('[data-genuin-cxr="stacked-top"]') as HTMLElement | null;
      const bottom = host.querySelector('[data-genuin-cxr="stacked-bottom"]') as HTMLElement | null;
      const root = top?.shadowRoot ?? null;
      return {
        slotHasShadowRoot: !!host.shadowRoot,
        topHeight: top?.offsetHeight ?? null,
        bottomHeight: bottom?.offsetHeight ?? null,
        bottomHasIframe: !!bottom?.querySelector("iframe"),
        hasCompactBar: !!root?.querySelector('[data-testid="compact-control-bar"]'),
        hasFullPlayer: !!root?.querySelector('[data-testid="video-layout-player"]'),
      };
    });

    expect(probe.slotHasShadowRoot).toBe(false);
    expect(probe.topHeight).toBe(probe.bottomHeight);
    expect(probe.bottomHasIframe).toBe(true);
    // 320×100 stacks as L3-on-top, so the compact bar is what renders.
    expect(probe.hasCompactBar).toBe(true);
    expect(probe.hasFullPlayer).toBe(false);
    expect(pageErrors).toEqual([]);
  });
});
