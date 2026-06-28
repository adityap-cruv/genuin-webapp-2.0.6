/**
 * Control-icon E2E — video content + ad config (setup C), real QA tag.
 *
 * Reels are `loop` videos and the tag enables a fullscreen ad break, so each
 * slide normalises to `video-with-ad` (VideoLayout + ad-break overlay). The
 * compact control chrome is the same shared CompactControlBar as setup A, so
 * the icon rules must hold here too.
 *
 *   FP-1c  play/pause + mute behavior holds on a video slide of a video+ad feed
 *   XS-1c  engagement carries across a swipe between mixed video/ad slides
 *
 * Icon shorthand: unmute.svg = sound-on / real-unmuted, mute.svg = real-muted.
 */
import { test, expect } from "@playwright/test";

import { CompactBar } from "./support/CompactBar.page";
import { mountWidget, TAG } from "./support/mountWidget";

test.describe("video + ad config (setup C)", () => {
  test("FP-1c: play/pause never flips the mute icon; mute cycles the real state", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoPlusAd, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForPlayable();

    const start = await bar.read();
    expect(start.muteIcon).toBe("unmute.svg");

    // Play/pause must not disturb the mute icon.
    await bar.tapPlay();
    const afterPlay = await bar.read();
    expect(afterPlay.muteIcon).toBe("unmute.svg");
    expect(afterPlay.playIcon).not.toBe(start.playIcon);

    // Mute cycle toggles the real state.
    await bar.tapMute(); // → unmute (audible)
    const unmuted = await bar.read();
    expect(unmuted.muteIcon).toBe("unmute.svg");
    expect(unmuted.videoVolume).toBeGreaterThan(0);

    await bar.tapMute(); // → muted
    const muted = await bar.read();
    expect(muted.muteIcon).toBe("mute.svg");
    expect(muted.videoVolume).toBe(0);
  });

  test("XS-1c: engagement carries across a swipe in a video+ad feed", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoPlusAd, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForPlayable();

    // Engage + mute on slide 0.
    await bar.tapMute();
    await bar.tapMute();
    const slide0 = await bar.read();
    expect(slide0.muteIcon).toBe("mute.svg");

    // Swipe to the next slide — real (muted) state carries over.
    const slide1 = await bar.swipeNext();
    expect(slide1.activeIndex).not.toBe(slide0.activeIndex);
    expect(slide1.muteIcon).toBe("mute.svg");

    // Mute still toggles on the arrived slide (not stuck).
    await bar.waitForPlayable();
    await bar.tapMute();
    expect((await bar.read()).muteIcon).toBe("unmute.svg");
  });

  test("EX-1: expanding to fullscreen preserves the mute state, and collapsing keeps it", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoPlusAd, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForPlayable();

    // Engage + mute on the compact bar.
    await bar.tapMute();
    await bar.tapMute();
    expect(await bar.muteIconAnywhere()).toBe("mute.svg");

    // Expand → fullscreen chrome; mute state carries over.
    expect(await bar.tapExpand()).toBe(true);
    expect(await bar.isFullscreen()).toBe(true);
    expect(await bar.muteIconAnywhere()).toBe("mute.svg");

    // Collapse → back to compact; state preserved.
    expect(await bar.tapCollapse()).toBe(true);
    expect(await bar.isFullscreen()).toBe(false);
    expect(await bar.muteIconAnywhere()).toBe("mute.svg");
  });

  // AB-1 — mid-roll ad break takeover. Deferred: even with real GenAd the break
  // overlay mounts but never reaches the visible "playing" state in the harness
  // within ~25s — the break's own GenAd slot doesn't fill/show under these test
  // conditions (the break likely triggers on a content-video position this tag's
  // short clip + headless playback doesn't reach). Needs investigation into the
  // break trigger before it can be asserted deterministically.
  test.fixme("AB-1: mid-roll ad break plays then advances the feed", async () => {
    // See note above — break overlay stays opacity:0 in the harness.
  });
});
