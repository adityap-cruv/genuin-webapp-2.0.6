/**
 * Control-icon E2E — embed-size coverage.
 *
 * The behavioral matrix runs densely on 320×100 (L4) in the other specs; the
 * icon logic is shared across sizes, so here we smoke-test that each size
 * renders working mute controls and the icon tracks the real state.
 *
 *   SZ-1  320×50  (L3) — compact bar, enticement + mute toggle
 *   SZ-2  300×250 (L2), 300×600 (L1) and 320×480 (L5) — default chrome, mute toggle
 *   SZ-3  320×480 (L5) — resolves to the full-player layout, not a compact bar
 *   SZ-4  320×480 (L5) — an ads-only tag reaches AdLayout + a real GenAd slot
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

  for (const size of ["L2", "L1", "L5"] as const) {
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

  // 320×480 is new, and its only signal that the size registered is which layout
  // the bundle picked. Asserted on the mounted DOM (no playback) so a failure here
  // means the size didn't resolve, not that the media/ad network misbehaved.
  test("SZ-3: 320x480 (L5) resolves to the full-player layout", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoOnly, size: "L5" });

    const probe = await page.evaluate(() => {
      const host = document.querySelector(".gen-ext") as HTMLElement;
      const root = host.shadowRoot as ShadowRoot;
      return {
        slot: [host.offsetWidth, host.offsetHeight],
        // Injected for GAM from the slot's own layout box.
        adSizeMeta: document.querySelector('meta[name="ad.size"]')?.getAttribute("content"),
        // Present only on the L1/L5 full-player path — the L3/L4 compact paths have no such node.
        hasFullPlayer: !!root.querySelector('[data-testid="video-layout-player"]'),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
      };
    });

    expect(probe.slot).toEqual([320, 480]);
    expect(probe.adSizeMeta).toBe("width=320,height=480");
    expect(probe.hasFullPlayer).toBe(true);
    expect(probe.hasCompactBar).toBe(false);
  });

  // The revenue path at the new size: an ads-only tag must reach AdLayout + a real
  // GenAd slot at 320×480, not the compact bar. Mount-only for the same reason as
  // SZ-3 — the waterfall's outcome is the ad server's business, the routing is ours.
  test("SZ-4: 320x480 (L5) routes an ads-only tag to the ad layout", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await mountWidget(page, { tagId: TAG.adOnly, size: "L5" });

    const probe = await page.evaluate(() => {
      const root = (document.querySelector(".gen-ext") as HTMLElement).shadowRoot as ShadowRoot;
      return {
        hasAdLayout: !!root.querySelector('[data-testid="ad-layout"]'),
        // GenAdSlot mints `gen-ad-slot-<instance>-<adId>` per slot.
        hasGenAdSlot: !!root.querySelector('[id^="gen-ad-slot-"]'),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
      };
    });

    expect(probe.hasAdLayout).toBe(true);
    expect(probe.hasGenAdSlot).toBe(true);
    expect(probe.hasCompactBar).toBe(false);
    expect(pageErrors).toEqual([]);
  });
});
