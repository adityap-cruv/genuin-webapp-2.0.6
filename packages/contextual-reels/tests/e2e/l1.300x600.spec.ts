/**
 * L1 — 300×600 desktop full player.
 *
 * L1 is the tall desktop unit, and the only one large enough that a publisher
 * routinely places it below the fold. That makes it the natural home for the
 * viewport-visibility strategy family, which nothing else in the suite reaches.
 *
 * It also owns the two layout-resolution cases that are not layouts of their
 * own: an unregistered slot size (→ `AD_LAYOUT.Unknown`, which renders L1's
 * path) and the stacked 300×600 variant (whose top half is our L1).
 *
 *   L1-ROUTE            300×600 resolves to the full-player chrome
 *   L1-UNKNOWN          336×280 → Unknown, still renders and still playable
 *   L1-STACKED          gen_variant=stacked splits the slot into equal halves
 *   L1-VIS-GATE         visibilityGate holds the render until the unit is seen
 *   L1-VIS-PASSBACK     a never-seen unit passes back with `unit_hidden`
 *   L1-DESTROY-ON-HIDE  destroyOnHide tears down on a later hide; default does not
 *   L1-EXPAND           expanding unmutes for real, and the unmute survives collapse
 *
 * Desktop-only: L1 does not ship to phones, so nothing here is tagged @mobile.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { WidgetPage } from "./support/WidgetPage";
import { captureAnalytics } from "./support/analytics";
import { mountWidget, TAG } from "./support/mountWidget";
import { waitUntil } from "./support/poll";

/** Highest volume across the mounted videos — the active slide's audio. */
const volume = (page: Page) =>
  page.evaluate(() => {
    const root = window.__cxrRoot() as ShadowRoot;
    const videos = Array.from(root.querySelectorAll("video")) as HTMLVideoElement[];
    return Math.max(0, ...videos.map((v) => (v.muted ? 0 : v.volume)));
  });

/** Whether the widget still has a mounted feed (vs. torn down after a passback). */
const hasFeed = (page: Page) =>
  page.evaluate(() => {
    const root = window.__cxrRoot();
    return !!root?.querySelector('[data-testid="video-layout"], [data-testid="ad-layout"]');
  });

test.describe("L1 — 300x600 full player", () => {
  test("L1-ROUTE: 300x600 resolves to the full-player layout", { tag: "@routing" }, async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L1" });

    const probe = await page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        slot: [host.offsetWidth, host.offsetHeight],
        // Injected for GAM from the slot's own layout box.
        adSizeMeta: document.querySelector('meta[name="ad.size"]')?.getAttribute("content"),
        hasFullPlayer: !!root.querySelector('[data-testid="video-layout-player"]'),
        hasTopBar: !!root.querySelector('[data-testid="default-top-bar"]'),
        // The compact chrome belongs to L3/L4 and must not appear here.
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
      };
    });

    expect(probe.slot).toEqual([300, 600]);
    expect(probe.adSizeMeta).toBe("width=300,height=600");
    expect(probe.hasFullPlayer).toBe(true);
    expect(probe.hasTopBar).toBe(true);
    expect(probe.hasCompactBar).toBe(false);
  });

  // A publisher can embed our tag at a size we never registered. `resolveAdLayout`
  // returns Unknown for it, and the widget must still render playable chrome
  // rather than branch on a layout it does not have, or throw.
  test("L1-UNKNOWN: an unlisted 336x280 slot resolves to Unknown and still renders", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await mountWidget(page, { tagId: TAG.video, size: [336, 280] });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    const probe = await page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        slot: [host.offsetWidth, host.offsetHeight],
        adSizeMeta: document.querySelector('meta[name="ad.size"]')?.getAttribute("content"),
        // Unknown is not a compact layout, so it takes the full-player path.
        hasFullPlayer: !!root.querySelector('[data-testid="video-layout-player"]'),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
      };
    });

    expect(probe.slot).toEqual([336, 280]);
    expect(probe.adSizeMeta).toBe("width=336,height=280");
    expect(probe.hasFullPlayer).toBe(true);
    expect(probe.hasCompactBar).toBe(false);

    // Unknown falls back to the default control row, and that row works.
    const before = await widget.muteIconAnywhere();
    expect(before).not.toBeNull();
    expect(await widget.tapMuteAnywhere()).toBe(true);
    expect(await widget.muteIconAnywhere()).not.toBe(before);
    expect(pageErrors).toEqual([]);
  });

  // Stacked: the slot splits into two equal halves — our widget mounts into the
  // top row as the config's `ourLayout` (L1 for a 300×600 slot, NOT L2 — the
  // player fills a 300×300 half exactly, where L2 is locked to 300×250 and would
  // leave a 50px gap), and an Infolinks in-place unit fills the bottom.
  test(
    "L1-STACKED: 300x600 splits into two equal halves under gen_variant=stacked",
    { tag: "@routing" },
    async ({ page }) => {
      // The bottom half loads the REAL Infolinks unit from a third party. When that
      // fetch is served an HTML error page instead of JS the frame throws
      // `SyntaxError: Unexpected token '<'` — their outage, not our bug. Anything
      // else (including a SyntaxError with a different message) still fails.
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => {
        const message = String(error);
        if (!message.includes("Unexpected token '<'")) pageErrors.push(message);
      });

      await mountWidget(page, { tagId: TAG.video, size: "L1", query: "gen_variant=stacked" });

      const probe = await page.evaluate(() => {
        const host = document.querySelector(".gen-ext") as HTMLElement;
        const top = host.querySelector('[data-genuin-cxr="stacked-top"]') as HTMLElement | null;
        const bottom = host.querySelector('[data-genuin-cxr="stacked-bottom"]') as HTMLElement | null;
        const root = top?.shadowRoot ?? null;
        return {
          // The shadow root moves OFF the slot and onto the top row when stacked.
          slotHasShadowRoot: !!host.shadowRoot,
          topHeight: top?.offsetHeight ?? null,
          bottomHeight: bottom?.offsetHeight ?? null,
          bottomHasIframe: !!bottom?.querySelector("iframe"),
          hasFullPlayer: !!root?.querySelector('[data-testid="video-layout-player"]'),
          hasCompactBar: !!root?.querySelector('[data-testid="compact-control-bar"]'),
        };
      });

      expect(probe.slotHasShadowRoot).toBe(false);
      expect(probe.topHeight).toBe(probe.bottomHeight);
      expect(probe.bottomHasIframe).toBe(true);
      // 300×600 stacks as L1-on-top, so the full player is what renders.
      expect(probe.hasFullPlayer).toBe(true);
      expect(probe.hasCompactBar).toBe(false);
      expect(pageErrors).toEqual([]);
    }
  );

  // `visibilityGate` holds the feed behind the skeleton until the unit is
  // actually on screen. Needs `offscreen` — with the slot at the top of the page
  // it is visible on mount and the gate opens before anything can be asserted.
  test("L1-VIS-GATE: visibilityGate holds the render until the unit is on screen", async ({ page }) => {
    await mountWidget(page, {
      tagId: TAG.video,
      size: "L1",
      strategies: { visibilityGate: true, visibilityGateTimeoutMs: 30_000 },
      offscreen: true,
      awaitMount: "none",
    });

    // Below the fold: the skeleton stands in and no feed mounts.
    await waitUntil(
      page,
      "the gated skeleton to render",
      () => !!window.__cxrRoot()?.querySelector('[data-testid="cxr-skeleton"]'),
      {
        timeoutMs: 10_000,
      }
    );
    expect(await hasFeed(page)).toBe(false);

    // Scroll it into view — the gate opens and the feed mounts for real.
    await page.evaluate(() => document.querySelector(".gen-ext")?.scrollIntoView());
    await waitUntil(
      page,
      "the feed to mount once visible",
      () => !!window.__cxrRoot()?.querySelector('[data-testid="video-layout"], [data-testid="ad-layout"]'),
      { timeoutMs: 15_000 }
    );
    expect(await hasFeed(page)).toBe(true);
  });

  // A unit that is never seen must pass the placement back rather than sit on a
  // silent skeleton forever. The reason rides on the event as `unit_hidden`,
  // which is the only thing distinguishing it from every other passback.
  test("L1-VIS-PASSBACK: a never-visible unit passes back with unit_hidden", async ({ page }) => {
    const events = await captureAnalytics(page);

    await mountWidget(page, {
      tagId: TAG.video,
      size: "L1",
      // Short timeout: the 30s production default would blow the test budget.
      strategies: { visibilityGate: true, visibilityGateTimeoutMs: 2000 },
      offscreen: true,
      awaitMount: "none",
    });

    // Never scrolled into view → the gate times out and fires the passback.
    const passback = await events.waitFor("Ad Passback", 25_000);
    expect(passback.details.passback_reason).toBe("unit_hidden");
    expect(await hasFeed(page)).toBe(false);
  });

  // After a first visibility the unit is committed: `unit_hidden` can never fire
  // again. Whether a LATER hide tears it down is `destroyOnHide`, off by default.
  for (const destroyOnHide of [false, true]) {
    test(`L1-DESTROY-ON-HIDE: a later hide ${destroyOnHide ? "tears down" : "is ignored"} when destroyOnHide is ${destroyOnHide}`, async ({
      page,
    }) => {
      const events = await captureAnalytics(page);
      await mountWidget(page, {
        tagId: TAG.video,
        size: "L1",
        strategies: { visibilityGate: true, visibilityGateTimeoutMs: 30_000, destroyOnHide },
        offscreen: true,
        awaitMount: "none",
      });

      // Make it visible once — this latches `hasBeenVisible`.
      await page.evaluate(() => document.querySelector(".gen-ext")?.scrollIntoView());
      await waitUntil(
        page,
        "the feed to mount once visible",
        () => !!window.__cxrRoot()?.querySelector('[data-testid="video-layout"], [data-testid="ad-layout"]'),
        { timeoutMs: 15_000 }
      );

      // Now scroll it back out of view.
      await page.evaluate(() => window.scrollTo(0, 0));
      await waitUntil(page, "the scroll to settle", () => window.scrollY === 0, { timeoutMs: 5000 });

      if (destroyOnHide) {
        await waitUntil(
          page,
          "the widget to tear down",
          () => !window.__cxrRoot()?.querySelector('[data-testid="video-layout"], [data-testid="ad-layout"]'),
          { timeoutMs: 10_000 }
        );
      } else {
        // Once visible, the unit stays up regardless of later visibility.
        expect(await hasFeed(page)).toBe(true);
      }
      // Either way the post-visibility path is SILENT — `unit_hidden` can never
      // fire after a first visibility, teardown or not.
      await events.expectNever("Ad Passback", 2000);
    });
  }

  // The banner chrome reports the REAL mute state (there is no sound-on
  // enticement outside CompactControlBar / AdControlBar), and expanding is
  // itself an audio action: `PlayerProvider` unmutes on `fullscreen:enter`,
  // and the unmute survives the collapse.
  test("L1-EXPAND: expanding unmutes for real and the unmute survives collapse", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L1" });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    // Loads silent, and the banner chrome says so.
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
