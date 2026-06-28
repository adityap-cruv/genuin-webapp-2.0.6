/**
 * Control-icon E2E — ad feed (setup B), real QA tag, REAL GenAd.
 *
 * The tag's reels are `type:"ads"`; each slot renders through AdLayout →
 * AdControlBar once the REAL GenAd waterfall fills. Mute toggles go through the
 * real SDK; assertions are on the control icon (and, where relevant, the real
 * completion-driven advance).
 *
 *   MU-1b  mute/unmute cycle on an ad slot toggles the real state
 *   OV-1   tapping the ad surface unmutes (engages audio) so the next mute tap mutes
 *   XS-1b  engage on slot 1, let the real ad COMPLETE → slot 2 reflects the real
 *          state (not a re-shown enticement) and mute still toggles
 *
 * SY-1 (force system mute) and NF-1 (force no-fill) are not reproducible with a
 * real, always-filling ad and are intentionally omitted under real GenAd.
 *
 * Icon shorthand: unmute.svg = sound-on / real-unmuted, mute.svg = real-muted.
 */
import { test, expect } from "@playwright/test";

import { CompactBar } from "./support/CompactBar.page";
import { mountWidget, TAG } from "./support/mountWidget";

test.describe("ad feed (setup B) — real GenAd", () => {
  test("MU-1b: mute/unmute cycles the real state on an ad slot", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.adOnly, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForAdBar();

    expect((await bar.read()).muteIcon).toBe("unmute.svg"); // enticement

    await bar.tapMute(); // enticement → unmute
    expect((await bar.read()).muteIcon).toBe("unmute.svg");

    await bar.tapMute(); // → muted
    expect((await bar.read()).muteIcon).toBe("mute.svg");

    await bar.tapMute(); // → unmuted
    expect((await bar.read()).muteIcon).toBe("unmute.svg");
  });

  test("OV-1: tapping the ad surface engages audio (next mute tap mutes, not unmutes)", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.adOnly, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForAdBar();
    expect((await bar.read()).muteIcon).toBe("unmute.svg"); // enticement

    // Tap the creative surface → handleAdClick → ad:unmuteRequest → real unmute.
    await bar.tapAdSurface();

    // Audio is now engaged. A mute-button tap therefore MUTES (→ mute.svg).
    // Without engagement, the first tap on the enticement would instead unmute
    // and stay on unmute.svg — so this distinguishes "engaged" from "enticement".
    await bar.tapMute();
    expect((await bar.read()).muteIcon).toBe("mute.svg");
  });

  test("XS-1b: engagement persists to the next ad slot after the ad completes", async ({ page }) => {
    test.setTimeout(90_000); // real ad plays to completion (~15–30s)
    await mountWidget(page, { tagId: TAG.adOnly, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForAdBar();

    // Engage + mute on slot 0 → mute.svg.
    await bar.tapMute();
    await bar.tapMute();
    const slot0 = await bar.activeSlideIndex();
    expect((await bar.read()).muteIcon).toBe("mute.svg");

    // Let the real ad complete; the feed advances on its own.
    const slot1 = await bar.waitForAdvance(slot0);
    expect(slot1).not.toBe(slot0);
    await bar.waitForAdBar();

    // Slot 1 must reflect the real (muted) state — not a re-shown enticement.
    expect((await bar.read()).muteIcon).toBe("mute.svg");

    // And the mute button still works: a tap unmutes (not stuck).
    await bar.tapMute();
    expect((await bar.read()).muteIcon).toBe("unmute.svg");
  });
});
