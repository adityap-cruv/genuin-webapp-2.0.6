/**
 * Control-icon E2E — embed-size coverage.
 *
 * The behavioral matrix runs densely on 320×100 (L4) in the other specs; the
 * icon logic is shared across sizes, so here we smoke-test that each size
 * renders working mute controls and the icon tracks the real state.
 *
 *   SZ-1  320×50  (L3) — compact bar, enticement + mute toggle
 *   SZ-2  300×250 (L2) and 300×600 (L1) — default chrome, mute toggle
 *
 * Icon shorthand: unmute.svg = sound-on / real-unmuted, mute.svg = real-muted.
 */
import { test, expect } from "@playwright/test";

import { CompactBar } from "./support/CompactBar.page";
import { mountWidget, TAG } from "./support/mountWidget";

test.describe("embed sizes", () => {
  test("SZ-1: 320x50 (L3) renders the compact bar and mute toggles", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoOnly, size: "L3" });
    const bar = new CompactBar(page);
    await bar.waitForPlayable();

    // L3 loads silent → sound-on enticement.
    expect(await bar.muteIconAnywhere()).toBe("unmute.svg");

    // First tap unmutes (audible); icon stays sound-on. Second mutes.
    expect(await bar.tapMuteAnywhere()).toBe(true);
    expect(await bar.muteIconAnywhere()).toBe("unmute.svg");
    await bar.tapMuteAnywhere();
    expect(await bar.muteIconAnywhere()).toBe("mute.svg");
  });

  for (const size of ["L2", "L1"] as const) {
    test(`SZ-2: ${size} renders working mute controls`, async ({ page }) => {
      await mountWidget(page, { tagId: TAG.videoOnly, size });
      const bar = new CompactBar(page);
      await bar.waitForPlayable();

      // A mute button is present and toggles the real state.
      const before = await bar.muteIconAnywhere();
      expect(before).not.toBeNull();
      expect(await bar.tapMuteAnywhere()).toBe(true);
      expect(await bar.muteIconAnywhere()).not.toBe(before);
    });
  }
});
