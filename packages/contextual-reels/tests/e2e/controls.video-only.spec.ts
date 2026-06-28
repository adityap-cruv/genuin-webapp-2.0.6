/**
 * Control-icon E2E — video-content feed (setup A), real QA tag.
 *
 *   FP-1  play/pause never disturbs the mute icon (the original bug)
 *   MU-1  mute/unmute cycle toggles the real state (icon + video.volume)
 *   XS-1  engagement persists across a slide swipe
 *   XS-2  play/pause on the arrived slide keeps the real icon
 *
 * MU-2 (audible-start, initialVolume>0) has no real tag among the captured
 * fixtures — it is covered deterministically by the merged Vitest unit test
 * in src/controls/CompactControlBar.test.tsx.
 *
 * Icon shorthand: unmute.svg = sound-on / real-unmuted, mute.svg = real-muted.
 */
import { test, expect } from "@playwright/test";

import { CompactBar } from "./support/CompactBar.page";
import { mountWidget, TAG } from "./support/mountWidget";

test.describe("video-only feed (setup A)", () => {
  test("FP-1: play/pause toggles playback but never flips the mute icon", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoOnly, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForPlayable();

    const start = await bar.read();
    expect(start.muteIcon).toBe("unmute.svg"); // enticement at load

    await bar.tapPlay();
    const after1 = await bar.read();
    await bar.tapPlay();
    const after2 = await bar.read();

    // Mute icon held the enticement across both play taps (the fix).
    expect(after1.muteIcon).toBe("unmute.svg");
    expect(after2.muteIcon).toBe("unmute.svg");
    // Play icon toggled on each tap.
    expect(after1.playIcon).not.toBe(start.playIcon);
    expect(after2.playIcon).not.toBe(after1.playIcon);
  });

  test("MU-1: mute/unmute cycles the real state (icon + video.volume)", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoOnly, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForPlayable();

    expect((await bar.read()).muteIcon).toBe("unmute.svg");

    await bar.tapMute(); // enticement → unmute (audible)
    const unmuted = await bar.read();
    expect(unmuted.muteIcon).toBe("unmute.svg");
    expect(unmuted.videoVolume).toBeGreaterThan(0);

    await bar.tapMute(); // → muted
    const muted = await bar.read();
    expect(muted.muteIcon).toBe("mute.svg");
    expect(muted.videoVolume).toBe(0);

    await bar.tapMute(); // → unmuted
    const reUnmuted = await bar.read();
    expect(reUnmuted.muteIcon).toBe("unmute.svg");
    expect(reUnmuted.videoVolume).toBeGreaterThan(0);
  });

  test("XS-1/XS-2: engagement persists across a swipe; play/pause keeps the real icon", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoOnly, size: "L4" });
    const bar = new CompactBar(page);
    await bar.waitForPlayable();

    // Engage + mute on slide 0 → mute.svg.
    await bar.tapMute();
    await bar.tapMute();
    const slide0 = await bar.read();
    expect(slide0.muteIcon).toBe("mute.svg");

    // Swipe to the next slide — must reflect the real (muted) state, no reset.
    const slide1 = await bar.swipeNext();
    expect(slide1.activeIndex).not.toBe(slide0.activeIndex);
    expect(slide1.muteIcon).toBe("mute.svg");

    // XS-2: play/pause on the arrived slide keeps the real icon.
    await bar.waitForPlayable();
    const beforePlay = await bar.read();
    await bar.tapPlay();
    const afterPlay = await bar.read();
    expect(afterPlay.muteIcon).toBe("mute.svg");
    expect(afterPlay.playIcon).not.toBe(beforePlay.playIcon);
  });
});
